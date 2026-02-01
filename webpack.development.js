import { merge } from 'webpack-merge';
import common from './webpack.common.js';

export default merge(common, {
    mode: 'development',
    devtool: 'inline-source-map',
    devServer: {
        host: '127.0.0.1',
        port: 8080,
        client: {
            logging: 'info',
            overlay: true,
        },
        compress: true,
        open: true,
        static: './build',
    },
    stats: {
        errorDetails: true,
    },
});
