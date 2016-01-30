{
    appDir: '../js',
    mainConfigFile: '../js/main.js',
    dir: '../django/testproject/static/js',
    baseUrl: '..',
    allowSourceOverwrites: true,
    paths: { requireLib: 'bower_components/requirejs/require'},
    optimize: "none",

    modules: [
        //First set up the common build layer.
        {
            //module names are relative to baseUrl
            name: 'js/main',
            include: ['requireLib']

        }
    ]
}