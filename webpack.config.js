const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
	devtool: 'inline-source-map',
	entry: [
		'./src/index'
	],
	plugins: [
		new webpack.NamedModulesPlugin(),
		new webpack.HotModuleReplacementPlugin(),
		new HtmlWebpackPlugin({
			title: 'Court of the Crimson King',
			hash: true
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
		publicPath: '/',
		filename: 'game.bundle.js',
	},
};
