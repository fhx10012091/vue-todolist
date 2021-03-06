const path = require('path')
const VueLoaderPlugin = require('vue-loader/lib/plugin')
const isDev = process.env.NODE_ENV === 'development'
const HTMLPlugin = require('html-webpack-plugin')
const ExtractPlugin = require('extract-text-webpack-plugin')
const webpack = require('webpack')
const createVueLoaderOptions = require('./build/vue-loader.config.js')
const config = {
    target: 'web',
    entry:path.join(__dirname+'/src/index.js'),
    output:{
        filename:'bundle.js',
        path:path.join(__dirname,'dist')
    },
    plugins:[
        new VueLoaderPlugin(),
        new HTMLPlugin(),
        new webpack.DefinePlugin({
            "process-env":{
                NODE_ENV: isDev ? '"development"' : '"production"'
            }
        })
    ],
    module:{
        rules:[
            {
                test:/\.vue$/,
                loader:'vue-loader',
                options: createVueLoaderOptions(isDev)
            },
            {
                test:/\.jsx$/,
                loader:'babel-loader'
            },
            {
                test:/\.(jpeg|jpg|png|svg|gif)$/,
                use:[
                    {
                        loader:'url-loader',
                        options:{
                            limit:1024,
                            name:'[name]-fhx.[ext]'
                        }
                    }
                ]
            }

        ]
    }
}
if(isDev){
    config.devtool = '#cheap-module-eval-source-map'
    config.devServer = {
        port: '8080',
        host: 'localhost',
        overlay: {
            errors: true
        },
        hot: true
    }
    config.module.rules.push(
        {
            test:/\.styl/,
            use:[
                'style-loader',
                'css-loader',
                {
                    loader: 'postcss-loader',
                    options: {
                        sourceMap: true
                    }
                },
                'stylus-loader'
            ]
        }
    )
    config.plugins.push(
        new webpack.HotModuleReplacementPlugin(),
        new webpack.NoEmitOnErrorsPlugin()
    )
}else{
    config.entry = {
        app: path.join(__dirname, '/src/index.js'),
        vendor: ['vue']
    }
    config.output.filename='[name].[chunkhash:8].js'
    config.module.rules.push({
        test:/\.styl/,
        use:ExtractPlugin.extract({
            fallback: 'style-loader',
            use:[
                'css-loader',
                {
                    loader: 'postcss-loader',
                    options: {
                        sourceMap: true
                    }
                },
                'stylus-loader'
            ]
        })
    })
    config.plugins.push(
        new ExtractPlugin('styles.[contentHash:8].css'),
        new webpack.optimize.CommonsChunkPlugin({
            name: 'vendor'
        }),
        new webpack.optimize.CommonsChunkPlugin({
            name: 'runtime'
        })
    )
}

module.exports = config