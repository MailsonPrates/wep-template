import React from "react";

const $ = function() {
    const refs = new Proxy(
      {},
      {
        get(target, key) {
          if (!target[key]) {
            target[key] = React.createRef();
          }
          return target[key];
        }
      }
    );
  
    return new Proxy(
      {refs},
      {
        get(target, key) {
            
            if (!target[key]) {
                target[key] = refs[key]?.current || null;
              }
              return target[key];
        }
      }
    )
  }
  
  export default $();
  
  