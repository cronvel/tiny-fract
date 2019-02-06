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



const kungFig = require( 'kung-fig' ) ;
const Dynamic = kungFig.Dynamic ;



function SvgFract( args ) {
	this.iteration = args.iteration ;
	this.data = [ { x: 0 , y: 0 } , { x: 1 , y: 0 } ] ;
}

module.exports = SvgFract ;



SvgFract.prototype.iterate = function() {
	var i , iMax , start , end ,
		next = [] ;
	
	for ( i = 0 , iMax = this.data.length - 1 ; i < iMax ; i ++ ) {
		start = this.data[ i ] ;
		end = this.data[ i + 1 ] ;
		
		next.push( start , ... this.iteration.map( e => Dynamic.getRecursiveFinalValue( e ) ) ) ;
	}
	
	next.push( end ) ;
	console.log( next ) ;
} ;



SvgFract.prototype.render = function() {
	var str = '' ;
	return str ;
} ;

