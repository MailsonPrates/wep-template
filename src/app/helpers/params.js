const params = {
    get: function(name,url){
        url||(url=window.location.href),name=name.replace(/[\[\]]/g,'\\$&');
        var regex=new RegExp('[?&]'+name+'(=([^&#]*)|&|#|$)'),results=regex.exec(url);
        return results?results[2]?decodeURIComponent(results[2].replace(/\+/g,' ')):'':null;
    },
    
    set: function(name, value, source){
        var multiParams = typeof name !== "string";

        var source = multiParams ? value : source;
        var src = source || window.location.href;
        var url = params.remove(name, src, (source ? true : false));
        var param = multiParams ? [] : name+"="+encodeURIComponent(value);

        if ( multiParams ){
            Object.keys(name).forEach(function(key){
                var value = name[key];
                url = params.remove(key, src, (source ? true : false));
                param.push(key + "=" + encodeURIComponent(value));
            });

            param = param.join("&");
        }

        var new_url = url.indexOf('?') !== -1 ? url+'&'+param : url+'?'+param; 
        !source && window.history.pushState(null, null, new_url);
        return new_url;
    },

    remove: function(params, source, preventReplace) {
        var url = typeof source == 'string' ? source : document.location.href;
        var urlparts= url.split('?');

        if ( urlparts.length>=2 ) {

            var urlBase = urlparts.shift(); 
            var queryString = urlparts.join("?"); 
            var prefix = encodeURIComponent(params)+'=';
            var pars = queryString.split(/[&;]/g);

            for ( var i = pars.length; i-->0; )               
              
            if ( pars[i].lastIndexOf(prefix, 0) !==-1 )   
                  pars.splice( i, 1 );
            url = urlBase+'?'+pars.join('&');

            var preventReplace = typeof source == 'boolean' ? source : preventReplace;
            if ( !preventReplace ) {
                window.history.replaceState(null, null, url);
            }
        }

        return url;
    }
}

export default params;