const express = require("express");
const app = express();
const mysql = require("mysql");
const mysqlConexion = require("express-myconnection");
const multer = require("multer");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");
const jwt = require('jsonwebtoken');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
const nodemailer = require('nodemailer');

// Crear el transportador de correo
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true, // true for port 465, false for other ports
  auth: {
    user: "razoj140@gmail.com", // tu correo
    pass: "pipmzycmxgjmlbqg",   // tu contraseña de aplicaciones de Google
  },
});

// Verificar el transportador
transporter.verify()
  .then(() => {
    console.log('All good, ready to send emails!');
  })
  .catch(err => {
    console.error('Error verifying the transporter:', err);
  });

async function main(correo,codigo) {
  try {
   
    const info = await transporter.sendMail({
      from: '"Maddison Foo Koch 👻" <razoj140@gmail.com>',
      to: `${correo}`,
      subject: "Hello ✔", 
      text: `${codigo}`, 
      html: `<b>${codigo}</b>`,
    });

    console.log("Message sent: %s", info.messageId);
  } catch (error) {
    console.error("Error sending email:", error);
  }
}

// Llamar a la función para enviar el correo



app.use(cors({
  origin: "https://omar-d35h.vercel.app",
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE"
}));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./imagenes"); 
  },
  filename: (req, file, cb) => {
    const ext = file.originalname.split(".").pop();
    cb(null, `${Date.now()}.${ext}`); 
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 } 
});


const dbConfig = {
  host: "198.59.144.133",
  user: "mavahost_juan",
  password: "juanito18*#.",
  database: "mavahost_omar",
  acquireTimeout: 10000, 
  connectTimeout: 10000, 
  timeout: 10000        
};



app.use(mysqlConexion(mysql, dbConfig, "single"));


app.use('/imagenes', express.static(path.join(__dirname, 'imagenes')));
app.get("/", (req, res) => {
  const query = `SELECT * FROM patrullas`;
  
  try {
    req.getConnection((err, con) => {
      if (err) {
        console.error("Error al conectar a la base de datos:", err);
        return res.status(500).send("Error al conectar a la base de datos");
      }

      con.query(query, (err, result) => {
        if (err) {
          console.error("Error al ejecutar la consulta:", err);
          return res.status(500).send("Error al ejecutar la consulta en la base de datos");
        }
        
        if (result.length === 0) {
          console.log("No se encontraron resultados.");
          return res.status(404).send("No se encontraron resultados.");
        } else {
          const resultsWithUrls = result.map(item => ({
            ...item,
                     imagen: item.imagen && !item.imagen.startsWith("https://ddcd-5.onrender.com/imagenes/")
              ? `https://ddcd-5.onrender.com/imagenes/${item.imagen}`
              : item.imagen 
          }));
          
          res.status(200).send(resultsWithUrls);
        }
      });
    });
  } catch (error) {
    console.error("Error inesperado:", error);
    res.status(500).send("Error inesperado");
  }
});




app.get("/mostrar", (req, res) => {
  const query = `SELECT * FROM patrullas_pendientes`;
  
  try {
    req.getConnection((err, con) => {
      if (err) {
        console.error("Error al conectar a la base de datos:", err);
        return res.status(500).send("Error al conectar a la base de datos");
      }

      con.query(query, (err, result) => {
        if (err) {
          console.error("Error al ejecutar la consulta:", err);
          return res.status(500).send("Error al ejecutar la consulta en la base de datos");
        }
        
        if (result.length === 0) {
          console.log("No se encontraron resultados.");
          return res.status(404).send("No se encontraron resultados.");
        } else {
             const resultsWithUrls = result.map(item => ({
            ...item,
             imagen: item.imagen ? `https://ddcd-5.onrender.com/imagenes/${item.imagen}` : null 
          }));
          res.status(200).send(resultsWithUrls);
        }
      });
    });
  } catch (error) {
    console.error("Error inesperado:", error);
    res.status(500).send("Error inesperado");
  }
});



app.post("/l", upload.single('imagen'), (req, res) => {
  console.log(req.body);

  const { placa, ubicacion, contacto, unidad, referencias, latitud, longitud, imagen } = req.body;
  console.log(ubicacion, placa, imagen);
  
  const imagenNombre = req.file ? req.file.filename : null; 


  const operacion = Number(req.body.operacion);  
console.log(operacion);

  
    const sql = 'INSERT INTO patrullas (placa, ubicacion, contacto, unidad, referencias, imagen, latitud, longitud) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
 
 
const values = [placa, ubicacion, contacto, unidad, referencias, imagen, latitud, longitud];

  req.getConnection((err, con) => {
    if (err) {
      console.error("Error de conexión a la base de datos:", err);
      return res.status(500).send('Error de conexión a la base de datos');
    }
    con.query(sql, values, (err, result) => {
      if (err) {
        console.error("Error al insertar en la base de datos:", err);
        return res.send(err);
      }     
    
      res.status(200).send({ message: 'Registro exitoso', id: result.insertId, imagen: imagen });
    });
  });
});








app.post("/registro", (req, res) => {
 console.log(req.body);
 
  const { correo, password, rol } = req.body;  
console.log(correo, password, rol );
const codigo = Math.floor(Math.random() * (999 - 100 + 1)) + 100;
  const sql = 'INSERT INTO usuarios (correo, contraseña, rol, codigo) VALUES (?, ?, ?, ?)';
  const values = [correo, password, rol, codigo];

  req.getConnection((err, con) => {
    if (err) {
      console.error("Error de conexión a la base de datos:", err);
      return res.status(500).send('Error de conexión a la base de datos');
    }

    con.query(sql, values, (err, result) => {
      if (err) {
        console.error("Error al insertar en la base de datos:", err);
        return res.status(500).send('Error al insertar en la base de datos');
      }else{
        main(correo, codigo).then(()=>{return res.send("se envio un codigo a tu correo")}).catch((e)=>{
       return   res.send(e)
        })
        
      }    
    });
  });
});


app.post("/login", (req, res) => {

  const {correo, password} = req.body
  console.log(req.body);
  
  const query = `SELECT * FROM usuarios WHERE correo = '${correo}' and contraseña ='${password}' `;
  
  try {
    req.getConnection((err, con) => {
      if (err) {
        console.error("Error al conectar a la base de datos:", err);
        return res.status(500).send("Error al conectar a la base de datos");
      }

      con.query(query, (err, result) => {
        if (err) {
          console.error("Error al ejecutar la consulta:", err);
          return res.status(500).send("Error al ejecutar la consulta en la base de datos");
        }
        
        if (result.length === 0) {
          console.log("No se encontraron resultados.");
          return res.status(404).send("No se encontraron resultados.");
        } else {
          const id = result[0].id;
          const rol = result[0].rol;
          const token = jwt.sign({ correo: correo }, "el botas", {expiresIn:"10m"});
          console.log(id);
          res.status(200).json({token, id,rol});
          console.log("correcto");
        }
      });
    });
  } catch (error) {
    console.error("Error inesperado:", error);
    res.status(500).send("Error inesperado");
  }
});



app.post("/pendientespost", upload.single('imagen'), (req, res) => {
  const body = Object.assign({}, req.body);
 
  if (!req.file) {
    return res.status(400).send('No se ha recibido ninguna imagen.');
  }
  const { placa, ubicacion, contacto, unidad, referencias, latitud, longitud} = req.body;
  const imagenNombre = req.file ? req.file.filename : null; 
  const operacion = Number(req.body.operacion);  // Convertir a número
console.log(operacion);

    const sql = 'INSERT INTO patrullas_pendientes (placa, ubicacion, contacto, unidad, referencias, imagen, latitud, longitud) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';

const values = [placa, ubicacion, contacto, unidad, referencias, imagenNombre, latitud, longitud];

  req.getConnection((err, con) => {
    if (err) {
      console.error("Error de conexión a la base de datos:", err);
      return res.status(500).send('Error de conexión a la base de datos');
    }
    con.query(sql, values, (err, result) => {
      if (err) {
        console.error("Error al insertar en la base de datos:", err);
        return res.send(err);
      }     
      const imagenUrl = imagenNombre ? `https://ddcd-5.onrender.com/imagenes/${imagenNombre}` : null;
      res.status(200).send({ message: 'Registro exitoso', id: result.insertId, imagen: imagenUrl });
    });
  });
});
app.post('/comprobar', (req, res) => {
  const { codigo, correo } = req.body;

  const sql = 'SELECT codigo FROM usuarios WHERE correo = ?';
  const values = [correo];

  req.getConnection((err, con) => {
      if (err) {
          console.error("Error de conexión a la base de datos:", err);
          return res.status(500).send('Error de conexión a la base de datos'); // Solo envía un string aquí
      }
      
      con.query(sql, values, (err, result) => {
          if (err) {
              console.error("Error al consultar en la base de datos:", err);
              return res.status(500).send('Error al consultar en la base de datos'); // Envía un string indicando el error
          }
          
          if (result.length === 0) {
              return res.status(404).send('Usuario no encontrado'); // Usuario no encontrado
          }

          if (result[0].codigo === parseInt(codigo)) {
              const actualizar = 'UPDATE usuarios SET verificacion = ? WHERE correo = ?';
              con.query(actualizar, [true, correo], (err) => {
                  if (err) {
                      console.error("Error al actualizar en la base de datos:", err);
                      return res.status(500).send('Error al actualizar en la base de datos'); // Este es el error que quieres
                  }
                  return res.send("Código verificado correctamente"); // Si todo va bien
              });
          } else {
              return res.status(401).json({
                  error: 'Código incorrecto', 
                  enviado: codigo, 
                  esperado: result[0].codigo 
              });
          }
      });
  });
});



app.listen(4200, () => {
  console.log("Server running on port 4200");
});
