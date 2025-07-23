import { resolve } from 'path';
import { readFileSync } from 'fs';
import { execSync } from 'child_process';
import process from 'node:process';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import { WebpackManifestPlugin } from 'webpack-manifest-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import CssMinimizerPlugin from 'css-minimizer-webpack-plugin';
import CopyPlugin from 'copy-webpack-plugin';
import webpack from 'webpack';

const isEnvProduction = process.env.NODE_ENV === 'production';
const isEnvDevelopment = !isEnvProduction;

// Get version from package.json
const packageJson = JSON.parse(readFileSync('./package.json', 'utf8'));
const version = packageJson.version;

// Get commit hash
let commitHash = 'unknown';
try {
    commitHash = execSync('git rev-parse --short HEAD').toString().trim();
} catch {
    // Silently fail if git is not available or not a git repository
}

// Get build date (when webpack runs)
const buildDate = new Date().toISOString();

export default {
    target: ['browserslist'],
    // Webpack noise constrained to errors and warnings
    stats: 'errors-warnings',
    mode: isEnvProduction ? 'production' : isEnvDevelopment && 'development',
    // Stop compilation early in production
    bail: isEnvProduction,
    devtool: isEnvDevelopment && 'cheap-module-source-map',
    entry: './src/index.tsx',
    plugins: [
        // Inject build-time environment variables
        new webpack.DefinePlugin({
            'process.env.REACT_APP_VERSION': JSON.stringify(version),
            'process.env.REACT_APP_COMMIT_HASH': JSON.stringify(commitHash),
            'process.env.REACT_APP_BUILD_DATE': JSON.stringify(buildDate),
        }),
        // Generates an `index.html` file with the <script> injected.
        new HtmlWebpackPlugin({
            inject: true,
            template: 'public/index.html',
            templateParameters: {
                PUBLIC_URL: process.env.PUBLIC_URL,
            },
            ...(isEnvProduction
                ? {
                    minify: {
                        removeComments: true,
                        collapseWhitespace: true,
                        removeRedundantAttributes: true,
                        useShortDoctype: true,
                        removeEmptyAttributes: true,
                        removeStyleLinkTypeAttributes: true,
                        keepClosingSlash: true,
                        minifyJS: true,
                        minifyCSS: true,
                        minifyURLs: true,
                    },
                }
                : undefined),
        }),
        new CopyPlugin({
            patterns: [
                {
                    from: 'public',
                    filter: (resourcePath) => {
                        // ignore index.html
                        return !resourcePath.endsWith('public/index.html');
                    },
                },
            ],
        }),
        new WebpackManifestPlugin({
            fileName: 'asset-manifest.json',
            // publicPath: paths.publicUrlOrPath,
            generate: (seed, files, entrypoints) => {
                const manifestFiles = files.reduce((manifest, file) => {
                    manifest[file.name] = file.path;
                    return manifest;
                }, seed);
                const entrypointFiles = entrypoints.main.filter(
                    (fileName) => !fileName.endsWith('.map')
                );

                return {
                    files: manifestFiles,
                    entrypoints: entrypointFiles,
                };
            },
        }),
        new MiniCssExtractPlugin({
            filename: isEnvProduction
                ? 'static/css/[name].[contenthash:8].css'
                : isEnvDevelopment && 'static/css/[name].css',
            // There are also additional JS chunk files if you use code splitting.
            chunkFilename: isEnvProduction
                ? 'static/css/[name].[contenthash:8].chunk.css'
                : isEnvDevelopment && 'static/css/[name].chunk.css',
        })
    ],
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
            {
                test: /\.css$/i,
                use: [MiniCssExtractPlugin.loader, 'css-loader'],
            },
            {
                test: /\.(png|svg|jpg|jpeg|gif|ico)$/i,
                type: 'asset/resource',
            },
            {
                test: /\.(woff|woff2|eot|ttf|otf)$/i,
                type: 'asset/resource',
            },
        ],
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
    },
    optimization: {
        minimize: isEnvProduction,
        minimizer: [
            '...',
            new CssMinimizerPlugin(),
        ]
    },
    output: {
        path: resolve('build'),
        // Add /* filename */ comments to generated require()s in the output.
        pathinfo: isEnvDevelopment,
        // There will be one main bundle, and one file per asynchronous chunk.
        // In development, it does not produce real files.
        filename: isEnvProduction
            ? 'static/js/[name].[contenthash:8].js'
            : isEnvDevelopment && 'static/js/bundle.js',
        // There are also additional JS chunk files if you use code splitting.
        chunkFilename: isEnvProduction
            ? 'static/js/[name].[contenthash:8].chunk.js'
            : isEnvDevelopment && 'static/js/[name].chunk.js',
        assetModuleFilename: 'static/media/[name].[hash][ext]',
        clean: true,
    },
};
