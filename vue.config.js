module.exports = {
    baseUrl: '/dev/',
    configureWebpack: {
        module: {
            rules: [
                {
                    exclude: [
                        /sample-data\.json/
                    ]
                }
            ]
        }
    }
}
