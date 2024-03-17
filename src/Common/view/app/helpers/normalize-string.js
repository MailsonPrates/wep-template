/**
 * @param {string} str 
 * @param {bool} preventLower 
 * 
 * @returns {string}
 */
export default function normalizeString(str, preventLower){
    var str = str.toString() || "";

    if ( !preventLower ){
        str = str.toLowerCase();
    }
    
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}