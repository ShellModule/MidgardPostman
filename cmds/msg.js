const net = require("net");
const serversData = require("../serversData.json");
const flood = [];
const servers = new Array();

for (var i in serversData) {
  if (
    serversData[i].shortName.match(/^ctf[1-3]$/g) !== null ||
    serversData[i].shortName.match(/^dm[1-2]$/g) !== null ||
    serversData[i].shortName === "ls" ||
    serversData[i].shortName === "hns"
  ) {
    servers.push(serversData[i].shortName);
  }
}

module.exports.run = async (client, message, args) => {
  if (!args[0]) return message.channel.send("Type `!msg help`");
  if (args[0] === "help") {
    message.channel.send(
      "***FROM DISCORD TO SERVER:***\n" +
        "  **`!msg ctf# <your message>`** - sends your message to Midgard [CTF]\n" +
        "  **`!msg dm# <your message>`** - sends your message to Midgard [DM]\n" +
        "  **`!msg ls# <your message>`** - sends your message to (WM)Midgard [Last Stand]\n" + 
        "  **`!msg hns <your message>`** - sends your message to Midgard [HnS]\n" + 
        "  **#** should be replaced by the server number. For example `!msg ctf2`"
    );
    return;
  }

  if (flood.indexOf(message.member.user.id) != -1)
    return message.channel.send(
      "Antiflood. Don't spam " + `<@${message.member.user.id}>`
    );

  if (servers.includes(args[0])) {
    let server = serversData[servers[servers.indexOf(args[0])]];
    if (server.password === "")
      return message.channel.send("I cannot connect to the server");
    args = args.slice(1);
    if (!args[0])
      return message.channel.send("You need to type in your message!");

    let sock = new net.Socket();
    let toSend = args.join(" ");
    if (toSend.includes("\n")) {
      toSend = StrCut(toSend, "\n", 0);
    }

    sock.connect(server.port, server.ip);
    sock.on("connect", () => {
      sock.write(server.password + "\r\n");
      sock.write(`/say Discord[${message.member.user.username}] ${toSend}\r\n`);
      message.react("📨");
      flood.push(message.member.user.id);
      setTimeout(() => sock.destroy(), 3000);
    });

    sock.on("close", () => {
      let pos = flood.indexOf(message.member.user.id);
      if (pos != -1) {
        flood.splice(pos, 1);
      }
    });

    sock.on("error", () => {
      message.channel.send("Server is unavailable ");
    });
    return;
  }

  message.channel.send("Type `!msg help`");
};

module.exports.help = {
  name: "msg",
};

function StrCut(str, deli, offset) {
  let pos = str.indexOf(deli);
  return str.slice(0, pos + offset);
}
