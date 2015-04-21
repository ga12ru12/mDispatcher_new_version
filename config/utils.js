/**
 * Copyright (c) 2013 QGS. All Rights Reserved.
 *
 * This document contains proprietary and confidential information of QGS.
 * It may not be used for any other purposes,  reproduced in whole or in part, nor passed to any organization or person
 * without the specific permission in writing of the Technical Director, QGS.
 *
 * @see http://myqgs.com/terms
 * @see http://myqgs.com/privacy
 *
 * @author QGS
 *
 * <p>
 * Util functions
 * </p>
 */

/**
 * decrypt string
 *
 * @method decrypt
 * @param {String} encodedString
 * @return {String} Return decodedString
 */
function decrypt(encodedString){
    var decodedString = "";

    // seperate character
    var regex = String.fromCharCode(67);
    var arrEncoded = encodedString.split(regex);
    var split = String.fromCharCode(66);

    for(var iter in arrEncoded){
        if(arrEncoded[iter]){
            var arrChar = arrEncoded[iter].split(split);
            var cSplit = String.fromCharCode(65);
            var arrInfor = arrChar[1].split(cSplit);
            var pLength = arrInfor.length-1;
            var pIndex = 0;

            for(var i = pLength - 1; i >= 0 ; i--){
                var s= arrInfor[i];
                var c = parseInt(s);
                pIndex = (pIndex * 249 + c);
            }

            pIndex^= 65535; // 65535

            var arrKey = arrChar[0].split(cSplit);
            var length = arrKey.length-1;
            // get primary number index
            var oNumb = 0; // original numb;
            for(var i = length -1 ; i >= 0 ; i--){
                var s = arrKey[i];
                var c = parseInt(s);
                oNumb = oNumb * 249 + c;

            }
            oNumb^= getPrimaryNumb(pIndex)^ 65535;
            oNumb^= 255; // 255
            var c= String.fromCharCode(oNumb);
            decodedString+= c;
        }
    }
    return decodedString;
}
/**
 * getPrimaryNumb
 *
 * @method getPrimaryNumb
 * @param {Number} index
 * @return {Number} Return index
 */
function getPrimaryNumb(index){
    if(index >= 5000)
        return -1;

    var isOk = false;
    var j = 1;
    var i = 0;
    while(i < 5001)
    {
        isOk = false;
        while(!isOk){
            j++;
            var sqr = parseInt(Math.sqrt(parseFloat(j))) + 1;
            isOk = true;
            for(var k = 2; k < sqr; k++){
                if(j%k == 0){
                    isOk = false;
                    break;
                }
            }
        }

        if(i == index)
            return j;
        i++;
    }
    return -1;
}
/**
 * revertEmail
 *
 * @method revertEmail
 * @param {String} email
 * @return {String} Return email reverted
 */
function revertEmail(email){
    var index = email.split(".")[email.split(".").length-1];
    return email.slice(0,index) + "@" + email.slice(index, (email.length- index.toString().length)-1);
}
/**
 * convertEmail
 *
 * @method convertEmail
 * @param {String} email
 * @return {String} Return email converted
 */
function convertEmail(email){
    var index = email.indexOf("@");
    return email.replace("@","").concat("."+index.toString());
}
function generateId() {
    var r = new Buffer(16);
    for(var i = 0; i < r.length; i++) {
        r[i] = 48 + Math.floor(Math.random() * 10);  // '0'..'9'
    }
    return r.toString();
}
function decodeStr(str) {
    var alphaIndex = {};
    if (str.length === 0) {
        return '';
    }
    return str.replace(/&(#?[\w\d]+);?/g, function(s, entity) {
        var char, code;
        if (entity.charAt(0) === "#") {
            if (entity.charAt(1) === 'x') {
                code = parseInt(entity.substr(2).toLowerCase(), 16);
            } else {
                code = parseInt(entity.substr(1));
            }
            if (isNaN(code) || code < -32768 || code > 65535) {
                char = '';
            } else {
                char = String.fromCharCode(code);
            }
        } else {
            char = alphaIndex[entity];
        }
        if (char === void 0) {
            return s;
        } else {
            return char;
        }
    });
}
module.exports = {
    decrypt : decrypt,
    revertEmail : revertEmail,
    convertEmail : convertEmail,
    generateId : generateId,
    decodeStr : decodeStr
};