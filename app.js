const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const session = require('express-session');
const passport = require('passport');
const flash = require('connect-flash');

// Importe as rotas
const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const authRouter = require('./routes/authRoutes'); // Nova rota de autenticação

const app = express();

// Configuração do Passport (deve vir antes das rotas)
require('./config/auth');

// Configuração da view engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Middlewares
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Configuração de sessão (deve vir antes do Passport)
app.use(session({
  secret: process.env.SESSION_SECRET || 'segredo_temporario_dev',
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 1 dia
  }
}));

// Flash messages (para mensagens de erro)
app.use(flash());

// Inicialize o Passport
app.use(passport.initialize());
app.use(passport.session());

// Middleware para variáveis globais
app.use((req, res, next) => {
  res.locals.user = req.user; // Disponibiliza o usuário em todas as views
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  console.log(`[ROTA ACESSADA]: ${req.method} ${req.url}`);
  next();
});

// Rotas
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/', authRouter); // Adicione as rotas de autenticação

// Captura 404 e encaminha para o manipulador de erros
app.use(function(req, res, next) {
  next(createError(404));
});

// Manipulador de erros
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;