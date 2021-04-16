
if (!console.__chk)
{
    console.__dir = console.dir.bind(console);
    console.__log = console.log.bind(console);
    
    console.__chk = function(obj)
    {
        try
        {
            if (typeof obj != 'object')
                return false;
            
            if ((obj.constructor == Function || obj.constructor == RegExp) && obj.hasOwnProperty('toString'))
                return true;
            
            for (var prop of Object.values(Object.getOwnPropertyDescriptors(obj)))
                if (prop.get && !prop.set && !prop.enumerable)
                    return true;
        }
        catch (exc) {}

        return false;
    };

    console.dir = function(obj)
    {
        console.__chk(obj) || console.__dir.apply(null, arguments);
    };

    console.log = function(fmt, obj)
    {
        console.__chk(typeof fmt == 'string' ? obj : fmt) || console.__log.apply(null, arguments);
    };
}
