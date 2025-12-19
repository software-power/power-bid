const express = require('express');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

// Load environment variables
const environment = process.env.NODE_ENV || 'development';

dotenv.config({
  path: `.env.${environment}`,
});

const app = express();

const payRollConfig = {
  base_url: process.env.BASE_URL || 'http://10.10.100.15',
  port: process.env.PORT || 9095,
};

// Middleware to log client IP (optional)
app.use((req, res, next) => {
  const clientIp = req.ip || req.connection.remoteAddress;
  next();
});

app.use(helmet());
app.use(cors({ origin: process.env.ALLOWED_ORIGINS || '*' }));
app.use(
  bodyParser.urlencoded({
    limit: '100mb',
    extended: true,
    parameterLimit: 50000,
  })
);
//cdn 

app.use(bodyParser.json({
  limit: '100mb',
  verify: (req, res, buf) => {
    req.rawBodySize = buf.length;
  }
}));

app.use((req, res, next) => {
  if (req.rawBodySize) {
    console.log(
      `[${req.method}] ${req.originalUrl} - Parsed size: ${(req.rawBodySize / 1024).toFixed(2)} KB`
    );
  }
  next();
});

// Register all  routes 
const usersRoutes = require('./Routes/usersRoute');
const mcheniRoutes = require('./Routes/mcheniRoute');
const leaveRoutes = require('./Routes/leaveRoute');
const payrollYearRoute = require('./Routes/payrollyearRoute');
const payslipRoute = require('./Routes/payslipRoute');
const loanRoutes = require('./Routes/loanRoutes');




app.use('/users', usersRoutes);
app.use('/hello', mcheniRoutes);

app.use('/leave', leaveRoutes);
app.use('/payroll-months', payrollYearRoute);
app.use('/payslips', payslipRoute);
app.use('/loan', loanRoutes);

const attachmentsRoute = require('./Routes/attachmentsRoute');
const tendersRoute = require('./Routes/tendersRoute');
const quotationsRoute = require('./Routes/quotationsRoute'); // Import quotations route

app.use('/attachments', attachmentsRoute);
app.use('/tenders', tendersRoute);
app.use('/quotations', quotationsRoute); // Register quotations route

// Serve static files from public directory
app.use('/public', express.static(path.join(__dirname, 'public')));

const reactBuildPath = path.join(__dirname, '../frontend/build');
app.use(express.static(reactBuildPath));
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(reactBuildPath, 'index.html'));
});


// Start server
app.listen(payRollConfig.port, '0.0.0.0', () => {
  console.log(
    `✅ Payroll app listening at ${payRollConfig.base_url}:${payRollConfig.port}`
  );
});

