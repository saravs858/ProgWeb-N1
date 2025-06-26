const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const auth = require('../middlewares/auth');

// Rotas de autenticação
router.get('/login', authController.loginForm);
router.post('/login', authController.login);
router.get('/logout', authController.logout);

// Rota protegida de exemplo
router.get('/dashboard', auth.isLoggedIn, (req, res) => {
    res.render('dashboard', { user: req.user });
});

module.exports = router;