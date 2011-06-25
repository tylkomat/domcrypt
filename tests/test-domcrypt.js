/* ***** BEGIN LICENSE BLOCK *****
 * Version: MPL 1.1/GPL 2.0/LGPL 2.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Original Code is mozilla.org code.
 *
 * The Initial Developer of the Original Code is
 * the Mozilla Foundation.
 * Portions created by the Initial Developer are Copyright (C) 2010
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *  David Dahl <ddahl@mozilla.com>
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either the GNU General Public License Version 2 or later (the "GPL"), or
 * the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
 * in which case the provisions of the GPL or the LGPL are applicable instead
 * of those above. If you wish to allow use of your version of this file only
 * under the terms of either the GPL or the LGPL, and not to allow others to
 * use your version of this file under the terms of the MPL, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the GPL or the LGPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under
 * the terms of any one of the MPL, the GPL or the LGPL.
 *
 * ***** END LICENSE BLOCK ***** */

function testDOMCrypt()
{
  var pubkey, cipherMessage, signature;
  var _passphrase = "foobar";
  var message =
    "This is a message about Mr. Mossop and his penchant for Belgian Doubles";
    // generate a key pair
    window.mozCipher.pk.generateKeypair(function (aPublicKey){
      document.getElementById("results").innerHTML = aPublicKey;

        // get the public key just created
        window.mozCipher.pk.getPublicKey(function (aPubKey){
          pubkey = aPubKey;
          document.getElementById("results-pub-key").innerHTML = aPubKey;

          // encrypt a string
          window.mozCipher.pk.encrypt(message, pubkey, function (aCipherMessage){
            document.getElementById("results-encrypt").innerHTML =
              aCipherMessage.content;
              cipherMessage = aCipherMessage;

            // decrypt a string
            window.mozCipher.pk.decrypt(cipherMessage, function (aPlainText){
              document.getElementById("results-decrypt").innerHTML = aPlainText;

              // sign a message
              window.mozCipher.pk.sign(message, function (aSignature){
              document.getElementById("results-sign").innerHTML = aSignature;
              signature = aSignature;

                // verify a signature
                window.mozCipher.pk.verify(message, signature, pubkey, function (aVerification){
                  var resultMessage;
                  if (aVerification) {
                    resultMessage = "Signature was Verified";
                  }
                  else {
                    resultMessage = "Verification Failed";
                  }
                  document.getElementById("results-verify").innerHTML =
                    resultMessage;

                  // make a SHA256 HASH
                  window.mozCipher.hash.SHA256("Belgian Triples Anyone?",
                    function (aHash){
                      document.getElementById("results-sha256").innerHTML = aHash;
                      symEncrypt();
                  });
              });
            });
          });
        });
      });
    });
}

var beginMSec, endMSec;

function startEncrypt()
{
  mozCipher.pk.getPublicKey(function (aPubKey){
    encryptText(aPubKey);
  });
}

function encryptText(aPubKey)
{
  var t = document.getElementById("to-encrypt").value;
  if (t) {
    beginMSec = Date.now();
    mozCipher.pk.encrypt(t, aPubKey , function (cipherMessage) {
      endMSec = Date.now();
      document.getElementById("encrypt-seconds").textContent = "encrypt() took: "
        + ((endMSec - beginMSec) / 1000) + " Seconds.";
      // Callback to handle the encrypted data
      document.message = cipherMessage;
      document.getElementById("encrypted").textContent = document.message.content;
    });
  }
  else {
    alert("No text to encrypt!");
  }
}

function decryptText()
{
  var cipherMessage = document.message;
  if (document.message.content) {
    document.getElementById("to-encrypt").value = "";
    beginMSec = Date.now();
    mozCipher.pk.decrypt(document.message, function (plainText) {
      endMSec = Date.now();
      // callback to deal with decrypted text
      document.getElementById("decrypt-seconds").textContent = "decrypt() took: "
        + ((endMSec - beginMSec) / 1000) + " Seconds.";
      document.getElementById("encrypted").textContent = plainText;
    });
  }
}

function symEncrypt()
{
  mozCipher.pk.getPublicKey(function (aPubKey){
  console.log("public key: ", aPubKey);
  console.log("The public key is used to wrap the symmetric key after the data is encrypted");
  var text = "It was a bright cold day in April";
  console.log("encrypting: ", text);
  mozCipher.sym.encrypt(text,
                        aPubKey,
                        function (cipherObj){
                          document.symEncryptResults = { pubKey: aPubKey,
                                                         cipherObj: cipherObj };
                          console.log("cipher text: ");
                          console.log(cipherObj.cipherText);
                          document.getElementById("sym-encrypt-results").innerHTML =
                            cipherObj.cipherText;
                          console.log("ok, time to decrypt");
                          symDecrypt(cipherObj);
                        });
  });
}

function symDecrypt(aCipherObject)
{
  var cipherObj;
  if (aCipherObject) {
    cipherObj = aCipherObject;
  }
  else {
    cipherObj = document.symEncryptResults.cipherObj;
  }
  console.log("decrypting data...");
  mozCipher.sym.decrypt(cipherObj,
                        function (plainText) {
                          console.log("plain text: ");
                          console.log(plainText);
                          document.getElementById("sym-decrypt-results").innerHTML =
                            plainText;
                        });
}

function symGenerateKey()
{
  // All symmetric keys need to be wrapped (encrypted) by a public key
  mozCipher.pk.getPublicKey(function (pubKey){
    mozCipher.sym.generateKey(pubKey, function (wrappedSymKeyObj){
      // The wrappedSymKeyObj has the following format:
      // { wrappedKey: [WRAPPED_KEY], iv: [INIT VECTOR], pubKey: [PUBLIC KEY] }
    });
  });
}