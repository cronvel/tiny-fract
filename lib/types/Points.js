/*
	Tiny Fract

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



const SvgFract = require( '../SvgFract.js' ) ;

const math = require( 'math-kit' ) ;
const geometry = math.geometry ;
const Vector2D = geometry.Vector2D ;



function Points( config ) {
	SvgFract.call( this , config ) ;
}

module.exports = Points ;

Points.prototype = Object.create( SvgFract.prototype ) ;
Points.prototype.constructor = Points ;



Points.prototype.iterate = function( count = 1 ) {
	var i , iMax , start , end , axis , next ,
		tmp = [] ;
	
	while ( count -- ) {
		next = tmp ;
		next.length = 0 ;
		
		for ( i = 0 , iMax = this.data.length - 1 ; i < iMax ; i ++ ) {
			start = this.data[ i ] ;
			end = this.data[ i + 1 ] ;
			
			// We don't normalize it, so we don't have to scale after transposition
			axis = Vector2D.fromTo( start , end ) ;	//.normalize() ;
			
			next.push( start , ... this.iteration.map( v => v.dup().untranspose( start , axis ) ) ) ;
		}
		
		next.push( end ) ;
		
		tmp = this.data ;
		this.data = next ;
		//console.log( this.data ) ;
	}
} ;

