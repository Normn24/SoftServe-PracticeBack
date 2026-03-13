const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const _ = require("lodash");
const uniqueRandom = require("unique-random");
const { z } = require("zod");
const rand = uniqueRandom(10000000, 99999999);

const Customer = require("../models/Customer");
const queryCreator = require("../commonHelpers/queryCreator");

const formatZodErrors = (zodError) => {
  const errors = {};
  zodError.errors.forEach(err => {
    if (err.path.length > 0) {
      errors[err.path] = err.message;
    }
  });
  return Object.keys(errors).length > 0? errors : { message: "Validation error" };
};

const nameRegex = /^[a-zA-Zа-яА-Я]+$/;
const loginRegex = /^[a-zA-Z0-9]+$/;
const passwordRegex = /^[a-zA-Z0-9]+$/;

const registrationSchema = z.object({
  firstName: z.string().regex(nameRegex, "Allowed characters for First Name is a-z, A-Z, а-я, А-Я.").min(2).max(25).optional(),
  lastName: z.string().regex(nameRegex, "Allowed characters for Last Name is a-z, A-Z, а-я, А-Я.").min(2).max(25).optional(),
  login: z.string().regex(loginRegex, "Allowed characters for login is a-z, A-Z, 0-9.").min(3).max(10).optional(),
  email: z.string().email("That is not a valid email."),
  password: z.string().regex(passwordRegex, "Allowed characters for password is a-z, A-Z, 0-9.").min(7).max(30)
});

const loginSchema = z.object({
  loginOrEmail: z.string().min(1, "Login or Email is required"),
  password: z.string().min(1, "Password is required")
});

const updateCustomerSchema = z.object({
  firstName: z.string().regex(nameRegex, "Allowed characters for First Name is a-z, A-Z, а-я, А-Я.").min(2).max(25).optional(),
  lastName: z.string().regex(nameRegex, "Allowed characters for Last Name is a-z, A-Z, а-я, А-Я.").min(2).max(25).optional(),
  login: z.string().regex(loginRegex, "Allowed characters for login is a-z, A-Z, 0-9.").min(3).max(10).optional(),
  email: z.string().email("That is not a valid email.").optional(),
});

const updatePasswordSchema = z.object({
  password: z.string().min(1, "Password is required"),
  newPassword: z.string().regex(passwordRegex, "Allowed characters for password is a-z, A-Z, 0-9.").min(7).max(30)
});

exports.createCustomer = async (req, res) => {
  const validation = registrationSchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json(formatZodErrors(validation.error));
  }

  const initialQuery = _.cloneDeep(req.body);
  initialQuery.customerNo = rand();

  const existingCustomer = await Customer.findOne({ email: req.body.email });
  
  if (existingCustomer) {
    return res.status(400).json({ message: `Email ${existingCustomer.email} already exists` });
  }

  const newCustomer = new Customer(queryCreator(initialQuery));
  
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(newCustomer.password, salt);
  
  newCustomer.password = hash;
  const savedCustomer = await newCustomer.save();
  
  res.json(savedCustomer);
};

exports.loginCustomer = async (req, res) => {
  const validation = loginSchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json(formatZodErrors(validation.error));
  }

  const loginOrEmail = req.body.loginOrEmail;
  const password = req.body.password;

  const customer = await Customer.findOne({ 
    $or: [{ email: loginOrEmail }, { login: loginOrEmail }] 
  });

  if (!customer) {
    return res.status(404).json({ loginOrEmail: "Customer not found" });
  }

  const isMatch = await bcrypt.compare(password, customer.password);

  if (isMatch) {
    const payload = {
      id: customer.id,
      firstName: customer.firstName,
      lastName: customer.lastName,
      isAdmin: customer.isAdmin
    };

    const token = jwt.sign(payload, process.env.SECRET_OR_KEY, { expiresIn: 36000 });
    
    res.json({ success: true, token: "Bearer " + token });
  } else {
    return res.status(400).json({ password: "Password incorrect" });
  }
};

exports.getCustomer = async (req, res) => {
  res.json(req.user);
};

exports.editCustomerInfo = async (req, res) => {
  const validation = updateCustomerSchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json(formatZodErrors(validation.error));
  }

  const initialQuery = _.cloneDeep(req.body);
  const currentEmail = req.user.email;
  const currentLogin = req.user.login;
  let newEmail;
  let newLogin;

  if (req.body.email) {
    newEmail = req.body.email;
    if (currentEmail!== newEmail) {
      const customer = await Customer.findOne({ email: newEmail });
      if (customer) {
        return res.status(400).json({ email: `Email ${newEmail} is already exists` });
      }
    }
  }

  if (req.body.login) {
    newLogin = req.body.login;
    if (currentLogin!== newLogin) {
      const customer = await Customer.findOne({ login: newLogin });
      if (customer) {
        return res.status(400).json({ login: `Login ${newLogin} is already exists` });
      }
    }
  }

  const updatedCustomerQuery = queryCreator(initialQuery);
  const updatedCustomer = await Customer.findOneAndUpdate(
    { _id: req.user.id },
    { $set: updatedCustomerQuery },
    { new: true }
  );

  res.json(updatedCustomer);
};

exports.updatePassword = async (req, res) => {
  const validation = updatePasswordSchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json(formatZodErrors(validation.error));
  }

  const customer = await Customer.findOne({ _id: req.user.id });

  if (!customer) {
    const error = new Error("Customer not found");
    error.statusCode = 404;
    throw error;
  }

  const oldPassword = req.body.password;
  const isMatch = await customer.comparePassword(oldPassword);

  if (!isMatch) {
    return res.status(400).json({ password: "Password does not match" });
  }

  const newPassword = req.body.newPassword;
  
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(newPassword, salt);
  
  customer.password = hash;
  const savedCustomer = await customer.save();

  res.json(savedCustomer);
};