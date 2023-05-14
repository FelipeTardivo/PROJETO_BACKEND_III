const express = require("express");
const { pool } = require("./data/data.js");
const jwt = require("jsonwebtoken");
const app = express();

const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get('/', (req, res) => {
    res.send('Página inicial')
});

app.post('/login', async (req, res) => {
    try {
        pool.connect();
        const { email, senha } = req.body;
        const result = await pool.query(`SELECT * FROM usuarios WHERE email = '${email}' AND senha = '${senha}'`);
        if (result.rowCount === 0) {
            res.status(404).json({ message: "Usuário não encontrado." });
        } else {
            res.json({
                token: jwt.sign({
                    id: result.rows[0].id,
                    email: result.rows[0].email,
                    nome: result.rows[0].nome
                }, process.env.JWT_SECRET),
                account: {
                    id: result.rows[0].id,
                    email: result.rows[0].email,
                    nome: result.rows[0].nome
                },
                message: "Login efetuado com sucesso."
            })
        }
    } catch (err) {
        console.log('Erro ao fazer login', err);
        res.status(500).json({ message: "Erro ao fazer login." });
    }
});

app.get('/users', async(req,res) =>{
    try {
        pool.connect();
        const result = await pool.query(`SELECT * FROM usuarios`);
        res.json(result.rows);
    } catch (err) {
        console.log('Erro ao buscar usuários', err);
        res.status(500).json({ message: "Erro ao buscar usuários." });
    }
});

app.post('/users', async(req,res) =>{
    try{
        pool.connect();
        const { email, senha, nome } = req.body;
        await pool.query(`INSERT INTO usuarios (nome , email, senha ) VALUES ('${nome}','${email}','${senha}')`);
        res.status(201).json({ message: "Usuário cadastrado com sucesso." });
    }catch(err){
        console.log('Erro ao cadastrar usuário', err);
        res.status(500).json({ message: "Erro ao cadastrar usuário." });
    }
});

app.put('/users/:id', async(req,res) =>{
    try{
        pool.connect();
        const { email, senha, nome } = req.body;
        const idUsuario = req.params.id;
        await pool.query(`UPDATE usuarios SET nome='${nome}', email='${email}',senha='${senha}' WHERE id=${idUsuario};`);
        res.json({ message: "Usuário atualizado com sucesso." });
    }catch(err){
        console.log('Erro ao atualizar usuário', err);
        res.status(500).json({ message: "Erro ao atualizar usuário." });
    }
});

app.delete('/users/:id', async(req,res) =>{
    try{
        pool.connect();
        const idUsuario = req.params.id;
        await pool.query(`DELETE FROM usuarios WHERE  id=${idUsuario};`);
        res.json({ message: "Usuário deletado com sucesso." });
    }catch(err){
        console.log('Erro ao deletar usuário', err);
        res.status(500).json({ message: "Erro ao deletar usuário." });
    }
});

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
