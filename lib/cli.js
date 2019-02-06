/*
	SVG Fract

	Copyright (c) 2019 Cédric Ronvel

	The MIT License (MIT)

	Permission is hereby granted, free of charge, to any person obtaining a copy
	of this software and associated documentation files (the "Software"), to deal
	in the Software without restriction, including without limitation the rights
	to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
	copies of the Software, and to permit persons to whom the Software is
	furnished to do so, subject to the following conditions:

	The above copyright notice and this permission notice shall be included in all
	copies or substantial portions of the Software.

	THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
	IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
	FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
	AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
	LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
	OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
	SOFTWARE.
*/

"use strict" ;



const fs = require( 'fs' ) ;
const kungFig = require( 'kung-fig' ) ;
const cliManager = require( 'utterminal' ).cli ;

const SvgFract = require( './SvgFract.js' ) ;



module.exports = function() {
	/* eslint-disable indent */
	cliManager.package( require( '../package.json' ) )
		.app( 'SVG Fract' )
		//.usage( "[--option1 value1] [--option2 value2] [...]" )
		.description( "Create SVG fractales." )
		.introIfTTY
		.helpOption
		.camel
		.arg( 'config' ).string.required
			.typeLabel( 'path' )
			.description( "The config file, using .kfg" )
		.opt( [ 'iterations' , 'it' , 'I' ] , 5 ).integer
			.description( "The number of iteration" )
	/* eslint-enable indent */

	var args = cliManager.run() ;

	var configPath = args.config ;
	delete args.config ;

	try {
		configPath = fs.realpathSync( configPath ) ;
	}
	catch ( error ) {
		console.error( error.message ) ;
		process.exit( 1 ) ;
	}

	var config = kungFig.load( configPath ) ;
	var svgFract = new SvgFract( config ) ;
	svgFract.iterate( args.iterations ) ;
	var str = svgFract.render() ;
	console.log( str ) ;
} ;


