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

const math = require( 'math-kit' ) ;
const geometry = math.geometry ;
const Vector2D = geometry.Vector2D ;
const BoundingBox2D = geometry.BoundingBox2D ;

const svg = require( 'svg-kit' ) ;



function SvgFract( args ) {
	this.iteration = args.iteration.map( point =>
		Vector2D.fromObject( Dynamic.getRecursiveFinalValue( point ) )
	) ;
	
	this.data = args.starting ?
		args.starting.map( point => Vector2D.fromObject( Dynamic.getRecursiveFinalValue( point ) ) ) :
		[ new Vector2D( 0 , 0 ) , new Vector2D( 200 , 0 ) ] ;
}

module.exports = SvgFract ;



SvgFract.prototype.iterate = function( count = 1 ) {
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



SvgFract.prototype.svgBoundingBox = function() {
	var bbox , tmp , size ;
	
	bbox = BoundingBox2D.fromPointCloud( this.data ) ;
	
	bbox.min.y *= -1 ;
	bbox.max.y *= -1 ;
	
	tmp = bbox.min.y ;
	bbox.min.y = bbox.max.y ;
	bbox.max.y = tmp ;
	
	size = Math.max( bbox.max.x - bbox.min.x , bbox.max.y - bbox.min.y ) ;
	
	bbox.min.x -= 1 + size * 0.05 ;
	bbox.min.y -= 1 + size * 0.05 ;
	bbox.max.x += 1 + size * 0.05 ;
	bbox.max.y += 1 + size * 0.05 ;
	
	return bbox ;
} ;



SvgFract.prototype.render = function() {
	var pathTag , bbox , str = '' ;
	
	bbox = this.svgBoundingBox() ;
	pathTag = '<path d="' + svg.path.dFromPoints( this.data , true ) + '" style="fill:none;stroke:black;stroke-width:1;" />' ;
	
	return svg.standalone( pathTag , bbox ) ;
} ;

