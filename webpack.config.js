/* eslint-disable */

/** @typedef {import('../package.json')} */
const package = require('./package.json');

/** @typedef {import('./src/manifest.json')} */
const manifest = require('./src/manifest.json');

const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { DefinePlugin } = require('webpack');

const PUBLIC_PATH = `/${package.name}`;
const BUILD_NUMBER = (function build_number() {
    const now = new Date();
    
    const yy = `${now.getUTCFullYear() % 100}`.padStart(2, '0');
    const mm = `${now.getUTCMonth() + 1}`.padStart(2, '0');
    const dd = `${now.getUTCDate()}`.padStart(2, '0');

    const h = now.getUTCHours() * 60 * 60;
    const m = now.getUTCMinutes() * 60;
    const s = now.getUTCSeconds();
    const elapsed = `${Math.trunc((h + m + s) / 10)}`.padStart(4, '0');
    
    return `${yy}${mm}${dd}${elapsed}`;
})();

(function update_manifest() {
    manifest.name = package.name;
    manifest.short_name = package.name;
    manifest.description = package.description;
    manifest.scope = `${PUBLIC_PATH}/`;
    manifest.start_url = `${PUBLIC_PATH}/`;
    manifest.share_target.action = `${PUBLIC_PATH}/index.html`;
})();

function config(env, name, dir, outdir = '') {
    /** @type {import('webpack').Configuration} */
    return {
        name: `${name}`,
        output: {
            path: path.join(process.cwd(), env.docs ? 'docs' : 'dist'),
            filename: `.${outdir}/[name].js`,
            assetModuleFilename: '[name][ext]',
            publicPath: PUBLIC_PATH
        },
        module: {
            rules: [{
                test: /\.tsx?$/,
                loader: 'ts-loader',
                exclude: [/node_modules/],
                options: {
                    configFile: `${dir}/tsconfig.json`
                }
            }, {
                test: /\.(png|svg|jpg|jpeg|gif|webmanifest)$/i,
                type: 'asset/resource',
            }]
        },
        resolve: {
            extensions: ['.tsx', '.ts', '.js'],
        }
    };
}

module.exports = (env, argv) => {
    const PRODUCTION = argv.mode === 'production';
    const DEVELOPMENT = !PRODUCTION;

    const defines = {
        PRODUCTION,
        DEVELOPMENT,
        APP_NAME: `"${package.name}"`,
        APP_VERSION: `"${package.version}"`,
        BUILD_NUMBER,
        PUBLIC_PATH: `"${PUBLIC_PATH}"`,
        SERVER: env.docs ? '"https://faultydeveloper.github.io"' : '"http://localhost:8080"'
    };
    const define_plugin = new DefinePlugin(defines);

    /** @type {import('webpack').Configuration} */
    const src_config = {
        ...config(env, 'client', 'src'),
        entry: {
            index: './src/index.ts'
        },
        plugins: [
            define_plugin,
            new HtmlWebpackPlugin({
                template: './src/index.ejs',
                filename: 'index.html',
                inject: false,
                minify: PRODUCTION,
                templateParameters: {
                    ...defines
                }
            }),
            new HtmlWebpackPlugin({
                templateContent: JSON.stringify(manifest, null, 2),
                filename: 'manifest.webmanifest',
                inject: false,
                minify: false
            })
        ]
    };

    /** @type {import('webpack').Configuration} */
    const sw_config = {
        ...config(env, 'service-worker', 'sw'),
        entry: {
            sw: './sw/sw.ts'
        },
        plugins: [
            define_plugin
        ]
    };

    return [src_config, sw_config];
}