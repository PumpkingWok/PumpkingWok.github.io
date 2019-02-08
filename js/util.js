$("#register").click(() => {
    if(window.u2f && window.u2f.register) {

      const appId = "https://pumpkingwok.github.io";
      var randomValues = new Uint8Array(32);
      window.crypto.getRandomValues(randomValues);
      var challenge = '';
      var char = String.fromCharCode;
      for(var i=0;i<randomValues.length;i++) {
        tempHex = randomValues[i].toString(16);
        if(tempHex.length==1) {
          tempHex = '0' + tempHex;
        }
        challenge += char('0x' + tempHex);
      }
      var result = {
          version: "U2F_V2",
          appId: appId,
          challenge: btoa(challenge).replace(/\//g,'_').replace(/\+/g,'-').replace(/=/g, '')
      };
      window.u2f.register(appId, [result], [], response => {
        console.log(response)
        var registration = checkRegistration(response);
        console.log(registration);
      });
    } else {
      document.write("<p>U2F is not supported</p>");
    }
});

$("#login").click(() => {
if(window.u2f && window.u2f.sign) {
  console.log('login');
} else {
document.write("<p>U2F is not supported</p>");
}
});

// Functions retrieved directly from u2f npm package


function checkRegistration(registerData) {

  // Parse registrationData.
  bufBase64 = registerData.registrationData.replace(/\_/g,'/').replace(/\-/g,'+');
  bufDecode = atob(bufBase64);

  var buf = new Uint8Array(bufDecode.length);
  for(var i=0;i<bufDecode.length;i++) {
    buf[i] = bufDecode.charCodeAt(i).toString(16);
  }
  var reserved = buf[0];                       buf = buf.slice(1);
  var publicKey = buf.slice(0, 65);            buf = buf.slice(65);
  var keyHandleLen = buf[0];                   buf = buf.slice(1);
  var keyHandle = buf.slice(0, keyHandleLen);  buf = buf.slice(keyHandleLen);
  var certLen = asnLen(buf);
  var certificate = buf.slice(0, certLen);     buf = buf.slice(certLen);
  var signLen = asnLen(buf);
  var signature = buf.slice(0, signLen);       buf = buf.slice(signLen);
  if (buf.length !== 0)
      console.error("U2F Registration Warning: registrationData has extra bytes: "+buf.toString('hex'));
  return {
    successful: true,
    publicKey: btoa(publicKey).replace(/\//g,'_').replace(/\+/g,'-').replace(/=/g, ''),
    keyHandle: registerData.keyHandle,
    certificate: certificate
  }
}

// Decode initial bytes of buffer as ASN and return the length of the encoded structure.
// See http://en.wikipedia.org/wiki/X.690
// Only SEQUENCE top-level identifier is supported (which covers all certs luckily)
function asnLen(buf) {

    // add 0x to express the value in hex
    var len = '0x' + buf[1];
    if (len & 0x80) { // long form
        var bytesCnt = len & 0x7F;
        len = 0;
        for (var i = 0; i < bytesCnt; i++)
            len = len*0x100 + buf[2+i];
        len += bytesCnt; // add bytes for length itself.
    }
    return len + 2; // add 2 initial bytes: type and length.
}
