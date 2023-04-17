const TeleBot = require("telebot");
const he = require("he");
const bot = new TeleBot("5889575921:AAHB8ktt32RtG5c_gJfmrvBY5KTuwUbWXKI");
const cors = require("cors");
const express = require("express");
const app = express();
const PORT = process.env.PORT;

bot.start();

app.use(cors());
/* 
bot.on(/^\/s (.+)$/, async function(msg, props) {
  const id = msg.chat.id;
  const url = "https://google.com";
  const message = `Read more about [Google](${url}) now!!!!`;

  return bot.sendMessage(id, message, { parseMode: 'Markdown' });
});
https://stackoverflow.com/questions/55761720/how-to-use-markdown-in-parse-mode-of-telegram-bot
 */
const id = 1835590672;

app.get("/", function (req, res) {
  console.log(req.route);
  res.json({ msg: "This is CORS-enabled for all origins!" });
});
app.use(express.json());
app.post("/", async function (req, res) {
  console.log(req.body);
  bot
    .sendMessage(id, "hola jose")
    .then((r) => {
      console.log(r);
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
  var tableRegex = /\|.*\|+\n\|(-+\|)+\n((\|.*\|+\n)+)/g;
  return text.replace(tableRegex, (markdownTable) => {
    return fixMarkdownTable(markdownTable);
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
//console.log(textocontablasarregladas);
var encodedMessage = extractAndEncodeHTMLCode(textocontablasarregladas);
/* console.log(he.encode.toString());
const PORT = process.env.PORT || 3000; */

//console.log(PORT);
console.log(encodedMessage);
bot
  .sendMessage(id, encodedMessage, { parseMode: "HTML" })
  .then((res) => console.log(res))
  .catch((res) => console.log(res));
