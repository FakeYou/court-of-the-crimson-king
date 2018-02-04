const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const PUBLIC_PATH = process.env.PUBLIC_PATH || '/';
console.log(PUBLIC_PATH);

module.exports = {
	devtool: 'inline-source-map',
	entry: [
		'./src/index'
	],
	plugins: [
		new webpack.DefinePlugin({
			'process.env.PUBLIC_PATH': JSON.stringify(PUBLIC_PATH)
		}),
		new webpack.NamedModulesPlugin(),
		new webpack.HotModuleReplacementPlugin(),
		new HtmlWebpackPlugin({
			title: 'Court of the Crimson King',
			hash: true,
		})
	],
	devServer: {
		host: 'localhost',
		port: 3001,
		hot: true,
		watchOptions: {
			poll: true
		}
	},
	output: {
		path: path.join(__dirname, './docs'),
		filename: 'game.bundle.js',
		publicPath: PUBLIC_PATH,
	},
};
