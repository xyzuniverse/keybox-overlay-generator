const fs = require("fs");
const xml2js = require("xml2js");

const keyboxFile = fs.readFileSync("./keybox.xml");

async function main() {
  // Parse the XML
  xml2js.parseString(keyboxFile, (err, result) => {
    if (err) {
      throw err;
    }

    // Navigate through the parsed object to extract certificates
    const keyboxes = result.AndroidAttestation.Keybox;
    keyboxes.forEach((keybox) => {
      const keys = keybox.Key;
      const ec_keys = keys[0];
      const rsa_keys = keys[1];

      const ecPrivateKey = certTrimmer(ec_keys.PrivateKey[0]._);
      const rsaPrivateKey = certTrimmer(rsa_keys.PrivateKey[0]._);
      const ecCerts = ec_keys.CertificateChain[0].Certificate;
      const rsaCerts = rsa_keys.CertificateChain[0].Certificate;

      const ecCertsOut = [];
      const rsaCertsOut = [];

      // Push the keys
      for (let x = 0; x < ecCerts.length; x++) {
        ecCertsOut.push(
          "    <item>EC.CERT_" +
            (x + 1) +
            ":" +
            certTrimmer(ecCerts[x]._) +
            "</item>"
        );
      }

      for (let x = 0; x < rsaCerts.length; x++) {
        rsaCertsOut.push(
          "    <item>RSA.CERT_" +
            (x + 1) +
            ":" +
            certTrimmer(rsaCerts[x]._) +
            "</item>"
        );
      }

      let result =
        `<string-array name="config_certifiedKeybox" translatable="false">\n` +
        `    <item>EC.PRIV:${ecPrivateKey}</item>\n` +
        `${ecCertsOut.join("\n")}\n` +
        `    <item>RSA.PRIV:${rsaPrivateKey}</item>\n` +
        `${rsaCertsOut.join("\n")}` +
        `\n</string-array>`;

      fs.writeFileSync("./output.txt", result);
      console.log("Overlay generated!");
    });
  });
}

function certTrimmer(array) {
  return array
    .split(/\r?\n|\r/g)
    .filter(
      (line) =>
        !line.includes("-----BEGIN EC PRIVATE KEY-----") &&
        !line.includes("-----END EC PRIVATE KEY-----") &&
        !line.includes("-----BEGIN RSA PRIVATE KEY-----") &&
        !line.includes("-----END RSA PRIVATE KEY-----") &&
        !line.includes("-----BEGIN CERTIFICATE-----") &&
        !line.includes("-----END CERTIFICATE-----")
    )
    .join("");
}

module.exports = main;
