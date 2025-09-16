/**
 * @param {object} config
 * @param {object} config.refs
 * @param {object} config.inputs
 * @param {function} config.onValidate
 */
export default function FormHandler(config={}){

    const prepares = {
        keepNumbers: (value="") => value.replace(/\D/g,''),
        lowerCase: (value="") => value.toLowerCase(),
    }

    const validate = function(props={}){
        
        const refs = config.refs || {};
        const inputs = config.inputs || {};
        const refKeys = Object.keys(refs);
        const refKeysLen = refKeys.length;
        const inputTypes = ['INPUT', 'SELECT', 'CHECKBOX', 'RADIO'];

        let isValid = true;
        let silent = typeof props.silent === "boolean" ? props.silent : false;
        let showInvalid = !silent;

        if ( !refKeysLen ){
            isValid = false;
        }

        for( let i=0; i<refKeysLen; i++ ){

            let key = refKeys[i];
            
            let $elem = refs[key].current;

            if ( !$elem ) continue;

            let tag = $elem.tagName;
            let isRequired = $elem.attributes.required;
            let name = $elem.name;

            if ( !inputTypes.includes(tag) || !isRequired ) continue;

            let value = $elem.value || "";
            //value = value.trim();

            const inputHandler = inputs[name] || {};

            inputHandler.prepare = typeof inputHandler.prepare === "string"
                ? prepares[inputHandler.prepare]
                : inputHandler.prepare;
            
            if ( typeof inputHandler.prepare === "function" ){
                value = inputHandler.prepare(value);
            }

            if ( value ){

                $elem.classList.remove("is-invalid");
                
                let hasValidation = typeof inputHandler.validate === 'function';

                let isValidValue = hasValidation ? inputHandler.validate(value) : true;

                if ( !isValidValue ){
                    isValid = false;
                    $elem.classList.add("is-invalid");
                    
                    if ( showInvalid ){
                        $elem.focus();
                        break;
                    }
                }

                $elem.value = value;

                continue;
            }

            if ( showInvalid ){
                $elem.classList.add("is-invalid");
                $elem.focus();
            }
            
            isValid = false;

            break;
        }

        typeof config.onValidate === "function" && config.onValidate(isValid);
        return isValid;
    }

    return {
        validate
    }
}