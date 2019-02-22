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

const operators = require( './operators.js' ) ;
const combinedOperators = Object.assign( {} , operators , kungFig.Expression.operators ) ;

const ndarray = require( 'ndarray' ) ;

const math = require( 'math-kit' ) ;
const geometry = math.geometry ;
const Complex = math.Complex ;



const DEFAULT_PALETTE = [
	{ r: 255 , g: 0 , b: 0 } ,
	{ r: 255 , g: 255 , b: 0 } ,
	{ r: 0 , g: 255 , b: 0 } ,
	{ r: 0 , g: 255 , b: 255 } ,
	{ r: 0 , g: 0 , b: 255 } ,
	{ r: 255 , g: 0 , b: 255 }
] ;



function RasterFract( config ) {
	this.reSteps = ( + config.width ) || 400 ;
	this.imSteps = ( + config.height ) || 300 ;
	this.aspect = this.reSteps / this.imSteps ;

	this.reCenter = config.origin && config.origin.re !== undefined ? + config.origin.re : -1 ;
	this.imCenter = config.origin && config.origin.im !== undefined ? + config.origin.im : 0 ;
	this.radius = config.radius !== undefined ? + config.radius : 2 ;
	
	this.reMin = null ;
	this.reMax = null ;
	this.imMin = null ;
	this.imMax = null ;
	
	this.iteration = config.iteration ?
		config.iteration.compile( combinedOperators ) :
		pixel => pixel.z.mul( pixel.z ).add( pixel.c ) ;
	
	
	this.bailout = config.bailout ?
		config.bailout.compile( combinedOperators ) :
		pixel => pixel.z.getSquareNorm() >= 4 ;
	
	/*
	console.log( 'iteration JS:' , config.iteration.toJs() ) ;
	console.log( 'bailout JS:' , config.bailout.toJs() ) ;
	*/
	
	this.data = ndarray( new Array( this.reSteps * this.imSteps ) , [ this.reSteps , this.imSteps ] ) ;
	
	this.palette = config.palette ? fixPalette( config.palette , config['resize-palette'] ) : DEFAULT_PALETTE ;
	
	this.init() ;
}

module.exports = RasterFract ;



RasterFract.prototype.init = function() {
	var re , im , reIndex , imIndex ;

	this.computeWindow() ;

	var reStep = ( this.reMax - this.reMin ) / ( this.reSteps - 1 ) ;
	var imStep = ( this.imMax - this.imMin ) / ( this.imSteps - 1 ) ;

	for ( re = this.reMin , reIndex = 0 ; re < this.reMax ; re += reStep , reIndex ++ ) {
		for ( im = this.imMin , imIndex = 0 ; im < this.imMax ; im += imStep , imIndex ++ ) {
			this.data.set( reIndex , imIndex , { z: new Complex( 0 , 0 ) , c: new Complex( re , im ) , iter: 0 , out: false } ) ;
		}
	}
} ;



RasterFract.prototype.computeWindow = function() {
	var reRadius = this.radius * Math.sqrt( this.aspect ) ;
	var imRadius = this.radius / Math.sqrt( this.aspect ) ;

	this.reMin = this.reCenter - reRadius ;
	this.reMax = this.reCenter + reRadius ;
	this.imMin = this.imCenter - imRadius ;
	this.imMax = this.imCenter + imRadius ;
	
	console.log( "Window:" ) ;
	console.log( { reCenter: this.reCenter , imCenter: this.imCenter , radius: this.radius , reMin: this.reMin , reMax: this.reMax , imMin: this.imMin , imMax: this.imMax } ) ;
} ;



function fixPalette( palette , resize ) {
	palette = palette.map( color => typeof color === 'string' ? hexToRgba( color ) : color ) ;
	
	if ( ! resize || resize === palette.length ) { return palette ; }

	var newIndex , floatIndex , floorIndex , ceilIndex , floorRate , ceilRate ,
		newPalette = new Array( resize ) ;
	
	for ( newIndex = 0 ; newIndex < resize ; newIndex ++ ) {
		floatIndex = newIndex * palette.length / resize ;
		floorIndex = Math.floor( floatIndex ) ;
		ceilIndex = Math.ceil( floatIndex ) ;
		
		if ( floorIndex === ceilIndex ) {
			newPalette[ newIndex ] = palette[ floorIndex ] ;
			continue ;
		}
		
		if ( ceilIndex === palette.length ) {
			// Interpolate between the last and the first palette color
			ceilIndex = 0 ;
		}
		
		floorRate = floorIndex + 1 - floatIndex ;
		ceilRate = 1 - floorRate ;
		
		newPalette[ newIndex ] = {
			r: palette[ floorIndex ].r * floorRate + palette[ ceilIndex ].r * ceilRate ,
			g: palette[ floorIndex ].g * floorRate + palette[ ceilIndex ].g * ceilRate ,
			b: palette[ floorIndex ].b * floorRate + palette[ ceilIndex ].b * ceilRate
		} ;
	}
	
	return newPalette ;
}



function hexToRgba( hex ) {
	// Strip the # if necessary
	if ( hex[ 0 ] === '#' ) { hex = hex.slice( 1 ) ; }

	if ( hex.length === 3 ) {
		hex = hex[ 0 ] + hex[ 0 ] + hex[ 1 ] + hex[ 1 ] + hex[ 2 ] + hex[ 2 ] ;
	}

	if ( hex.length === 6 ) {
		return {
			r: parseInt( hex.slice( 0 , 2 ) , 16 ) ,
			g: parseInt( hex.slice( 2 , 4 ) , 16 ) ,
			b: parseInt( hex.slice( 4 , 6 ) , 16 ) ,
			a: 255
		} ;
	}

	// length is 8:
	return {
		r: parseInt( hex.slice( 0 , 2 ) , 16 ) ,
		g: parseInt( hex.slice( 2 , 4 ) , 16 ) ,
		b: parseInt( hex.slice( 4 , 6 ) , 16 ) ,
		a: parseInt( hex.slice( 6 , 8 ) , 16 )
	} ;
}



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
				pixel.z = this.iteration( pixel ) ;
				
				if ( this.bailout( pixel ) ) {
					pixel.out = true ;
					break ;
				}
			}
		}
	}
} ;



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
				color = this.palette[ pixel.iter % this.palette.length ] ;
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

