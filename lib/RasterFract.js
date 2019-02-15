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



const kungFig = require( 'kung-fig' ) ;
const Dynamic = kungFig.Dynamic ;

const ndarray = require( 'ndarray' ) ;

const math = require( 'math-kit' ) ;
const geometry = math.geometry ;
const Complex = math.Complex ;



function RasterFract( config ) {
	this.reMin = -2.5 ;
	this.reMax = 1 ;
	this.reSteps = 351 ;
	this.imMin = -1.5 ;
	this.imMax = 1.5 ;
	this.imSteps = 301 ;
	
	this.bailout = 4 ;
	
	this.data = ndarray( new Array( this.reSteps * this.imSteps ) , [ this.reSteps , this.imSteps ] ) ;
	this.init() ;
}

module.exports = RasterFract ;



RasterFract.prototype.init = function() {
	var re , im , reIndex , imIndex ,
		reStep = ( this.reMax - this.reMin ) / ( this.reSteps - 1 ) ,
		imStep = ( this.imMax - this.imMin ) / ( this.imSteps - 1 ) ;
	
	for ( re = this.reMin , reIndex = 0 ; re < this.reMax ; re += reStep , reIndex ++ ) {
		for ( im = this.imMin , imIndex = 0 ; im < this.imMax ; im += imStep , imIndex ++ ) {
			this.data.set( reIndex , imIndex , { z: new Complex( re , im ) , c: new Complex( re , im ) , iter: 0 , out: false } ) ;
		}
	}
} ;



RasterFract.prototype.iterate = function( count = 1 ) {
	var iteration , pixel ,
		re , im , reIndex , imIndex ,
		reStep = ( this.reMax - this.reMin ) / ( this.reSteps - 1 ) ,
		imStep = ( this.imMax - this.imMin ) / ( this.imSteps - 1 ) ;
	
	for ( re = this.reMin , reIndex = 0 ; re < this.reMax ; re += reStep , reIndex ++ ) {
		for ( im = this.imMin , imIndex = 0 ; im < this.imMax ; im += imStep , imIndex ++ ) {
			for ( iteration = 0 ; iteration < count ; iteration ++ ) {
				pixel = this.data.get( reIndex , imIndex ) ;
				
				pixel.iter ++ ;
				pixel.z.mul( pixel.z ).add( pixel.c ) ;
				
				if ( pixel.z.norm > this.bailout ) {
					pixel.out = true ;
					break ;
				}
			}
		}
	}
} ;



var palette = [
	{ r: 255 , g: 0 , b: 0 } ,
	{ r: 255 , g: 255 , b: 0 } ,
	{ r: 0 , g: 255 , b: 0 } ,
	{ r: 0 , g: 255 , b: 255 } ,
	{ r: 0 , g: 0 , b: 255 } ,
	{ r: 255 , g: 0 , b: 255 }
] ;

RasterFract.prototype.render = function( params = {} ) {
	var pixel , color ,
		re , im , reIndex , imIndex ,
		reStep = ( this.reMax - this.reMin ) / ( this.reSteps - 1 ) ,
		imStep = ( this.imMax - this.imMin ) / ( this.imSteps - 1 ) ;
	
	var output = ndarray(
        new Uint8Array( this.reSteps * this.imSteps * 3 ) ,
        [ this.reSteps , this.imSteps , 3 ]
    ) ;
	
	for ( re = this.reMin , reIndex = 0 ; re < this.reMax ; re += reStep , reIndex ++ ) {
		for ( im = this.imMin , imIndex = 0 ; im < this.imMax ; im += imStep , imIndex ++ ) {
			pixel = this.data.get( reIndex , imIndex ) ;
			
			if ( pixel.out ) {
				// Out-coloring
				color = palette[ pixel.iter % palette.length ] ;
				output.set( reIndex , imIndex , 0 , color.r ) ;
				output.set( reIndex , imIndex , 1 , color.g ) ;
				output.set( reIndex , imIndex , 2 , color.b ) ;
			}
			else {
				// In-coloring
				output.set( reIndex , imIndex , 0 , 50 ) ;
				output.set( reIndex , imIndex , 1 , 50 ) ;
				output.set( reIndex , imIndex , 2 , 50 ) ;
			}
		}
	}
	
	return output ;
} ;

