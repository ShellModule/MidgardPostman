const net = require("net");
const serversData = require("../serversData.json");
const options = require("../options.json");
const sockets = new Array();
const servers = new Array();

for (var i in serversData) {
  if (
    serversData[i].shortName.match(/^ctf[1-9]$/g) !== null ||
    serversData[i].shortName.match(/^dm[1-3]$/g) !== null ||
    serversData[i].shortName.match(/^ls[1-3]$/g) !== null ||
    serversData[i].shortName === "hns"
  ) {
    sockets.push(new net.Socket());
    servers.push(serversData[i].shortName);
  }
}

module.exports.run = async (client, message, args) => {
  for (let i = 0; i < servers.length; i++) {
    connect(sockets[i], serversData[servers[i]]);
  }
  console.log("!msg from server: ACTIVE");

  function connect(socket, server) {
    socket.connect(server.port + 10, server.ip);
    events(socket, server, options[server.shortName.slice(0, server.shortName.length - 1)]);
  }

  async function events(socket, server, channelToSend) {
    var messageId = "cyrtf6g786tyr45r68futluf6t765dI^R^*T&6ftrxityg;p68";
    var first = true;
    var toSend = "";
    socket.on("connect", () => {
      socket.write(`STARTFILES\r\nmaps/discord.pms\r\nENDFILES`);
    });

    socket.on("data", (data) => {
      toSend = toSend + data.toString();
      if (toSend.includes("ENDFILES")) {
        if (toSend.includes(messageId)) {
          first = false;
          toSend = "";
        } else {
          toSend = toSend.split("\n");
          messageId = toSend[2];
          if (!first)
            client.channels.cache
              .get(channelToSend)
              .send("`" + server.msgPrefix + ":` " + toSend[3]);
          else first = false;
          toSend = "";
        }
        socket.end();
      }
    });

    socket.on("end", async () => {
      setTimeout(() => {
        socket.connect(server.port + 10, server.ip);
      }, 1000);
    });

    socket.on("error", () => {
      setTimeout(() => {
        socket.connect(server.port + 10, server.ip);
      }, 500);
    });
  }
};
module.exports.help = {
  name: "msgserver",
};
