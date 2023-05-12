const TeleBot = require("telebot");
const he = require("he");
const bot = new TeleBot("6256935640:AAH7V0TjQ6GyGqf0jGvKN00Qofu8qmQEKmw");
//const cors = require("cors");
const express = require("express");
const fetch = require("node-fetch");
const app = express();
const PORT = 5487 || process.env.PORT;

bot.start();

//app.use(cors());
/* 
bot.on(/^\/s (.+)$/, async function(msg, props) {
  const id = msg.chat.id;
  const url = "https://google.com";
  const message = `Read more about [Google](${url}) now!!!!`;

  return bot.sendMessage(id, message, { parseMode: 'Markdown' });
});
https://stackoverflow.com/questions/55761720/how-to-use-markdown-in-parse-mode-of-telegram-bot
 */

app.get("/", function (req, res) {
  console.log(req.route);
  res.json({ msg: "This is CORS-enabled for all origins!" });
});

async function sendMessageToPoe(messageFromUser, clearContext = false) {
  var urlPOE = "https://poe-leiner.onrender.com/talk/";
  var payload = {
    message: messageFromUser,
    clearContext,
  };

  var options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  };

  var result = await fetch(urlPOE, options)
    .then((res) => res.json())
    .then((res) => res);

  if (!result.noError) {
    return "Ocurrio un error:\n" + result.message;
  }
  return result.botRespuesta;
}

app.post("/", express.json(), async function (req, res) {
  var requestBody = req.body;

  //por si algun perro:
  //await bot.sendMessage(requestBody.message.chat.id, "hey ");
  if (
    !(
      requestBody.message.chat.id === 247812007 ||
      requestBody.message.chat.id === 1835590672
    )
  ) {
    await new Promise((resolve) => {
      setTimeout(() => {
        resolve(true);
      }, 5000);
    });
    await bot.sendMessage(
      requestBody.message.chat.id,
      "This is not your bot, get out"
    );

    return;
  }

  var clearContext = requestBody.message.text.charAt(0) === "/";

  var messageForPoe = clearContext
    ? requestBody.message.text.slice(1)
    : requestBody.message.text;

  var responseFromPoe = await sendMessageToPoe(messageForPoe, clearContext);
  /* console.log(responseFromPoe);
  res.json({ msg: responseFromPoe }); */
  var textocontablasarregladas = fixMarkdownTableInText(responseFromPoe);
  var encodedMessage = extractAndEncodeHTMLCode(textocontablasarregladas);

  bot
    .sendMessage(requestBody.message.chat.id, encodedMessage, {
      parseMode: "HTML",
    })
    .then((r) => {
      // console.log(res);
      res.json({ msg: "This is CORS-enabled for all origins!" });
    })
    .catch((err) => {
      console.log(err);
      res.json({ msg: "This is CORS-enabled for all origins!" });
    });
});

app.listen(PORT, function () {
  console.log("CORS-enabled web server listening on port " + PORT);
});

const url = "https://google.com";

var message = `
¡Claro! Aquí te hago una pequeña tabla de ejemplo:

| Nombre | Edad | Género |
| ------ | ---- | ------ |
| Ana    | 25   | Femenino |
| Juan   | 30   | Masculino |
| María  | 18   | Femenino |
| Luis   | 42   | Masculino |

Esta tabla tiene tres columnas: "Nombre", "Edad" y "Género", y cuatro filas que contienen información sobre cuatro personas diferentes. Espero que esto te haya sido útil.


¡Claro! Aquí está una tabla HTML básica:

\`\`\`
<table>
  <thead>
    <tr>
      <th>Encabezado 1</th>
      <th>Encabezado 2</th>
      <th>Encabezado 3</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Celda 1</td>
      <td>Celda 2</td>
      <td>Celda 3</td>
    </tr>
    <tr>
      <td>Celda 4</td>
      <td>Celda 5</td>
      <td>Celda 6</td>
    </tr>
  </tbody>
</table>
\`\`\`

Esta tabla tiene dos filas y tres columnas. La primera fila es el encabezado de la tabla y contiene tres celdas de encabezado (\` <
  th >
  \`), mientras que la segunda fila es el cuerpo de la tabla y contiene seis celdas de datos (\` <
  td >
  \`). Puedes agregar más filas al cuerpo de la tabla si quieres.`;
function extractAndEncodeHTMLCode(text) {
  //remover lo que estan entre ``` y ```
  var regex = /```(.*\n)+```/g;
  var regexMatches = text.match(regex);
  if (regexMatches !== null && regexMatches.length >= 1) {
    for (let i = 0; i < regexMatches.length; i++) {
      text = text.replace(
        regexMatches[i],
        "<pre>" + he.encode(regexMatches[i].slice(3, -3)) + "</pre>"
      );
    }
  }

  //remover lo que estan entre ` y `
  var regex = /`([^`]*)`/g;
  var regexMatches = text.match(regex);
  if (regexMatches !== null && regexMatches.length >= 1) {
    for (let i = 0; i < regexMatches.length; i++) {
      text = text.replace(
        regexMatches[i],
        he.encode(regexMatches[i].slice(1, -1))
      );
    }
  }
  return text;
}

function fixMarkdownTableInText(text) {
  text = text + "\n";
  //var tableRegex = /\|.*\|.*\|.*\|\n\|(-+\|)+(-+\|)+(-+\|)+\n(\|.*\|\n)+/g; //solo para tablas de 3 columnas
  var tableRegex = /(\|.*)+\|\n(\| *-+ *)+\|\n((\|.*\|+\n)+)/g;
  return text.replace(tableRegex, (markdownTable) => {
    var coincidencia = markdownTable.slice(0, -1);
    var result = fixMarkdownTable(coincidencia);
    console.log(result);
    return result;
  });
}

function fixMarkdownTable(markdown) {
  // Separar las filas de la tabla
  const rows = markdown.trim().split("\n");

  // Encontrar la longitud máxima de cada columna
  const columnLengths = rows.reduce((lengths, row) => {
    const columns = row.split("|").map((col) => col.trim());
    columns.forEach((col, i) => {
      if (col.length > lengths[i]) {
        lengths[i] = col.length;
      }
    });
    return lengths;
  }, new Array(rows[0].split("|").length).fill(0));

  // Construir la nueva tabla con las celdas centradas
  const fixedRows = rows.map((row) => {
    const columns = row.split("|").map((col) => col.trim());
    const fixedColumns = columns.map((col, i) => {
      const padding = " ".repeat(columnLengths[i] - col.length);
      return `${col}${padding}`;
    });
    return `${fixedColumns.join("|")}`;
  });

  // Unir las nuevas filas para formar la tabla completa
  var previo = fixedRows.join("\n") + "\n";
  return `<pre>${previo}</pre>`;
}

//funciones para arreglar tablas en formato markdown

//var message = `Read more about [Google](${url}) now!!!!`;
//var message = '<a href="https://google.com">Google</a>'; //si funciona con este
var textocontablasarregladas = fixMarkdownTableInText(message);
console.log(textocontablasarregladas);
var encodedMessage = extractAndEncodeHTMLCode(textocontablasarregladas);
/* console.log(he.encode.toString());
const PORT = process.env.PORT || 3000; */

//console.log(PORT);
/* console.log(encodedMessage);
bot
  .sendMessage(id, encodedMessage, { parseMode: "HTML" })
  .then((res) => {
    //console.log(res)
  })
  .catch((res) => {
     //console.log(res)
  });
 */
