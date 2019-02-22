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



/*
	KFG Expression custom operators
*/



const math = require( 'math-kit' ) ;
const Complex = math.Complex ;

//const getNamedParameters = require( 'kung-fig' ).Expression.getNamedParameters ;



exports.C = ( re , im ) => new Complex( re , im ) ;
exports.znorm = arg => arg.getNorm() ;
exports.zsquarenorm = exports.zsqnorm = arg => arg.getSquareNorm() ;



exports.zadd = ( ... args ) => {
	var i , v ;
	
	v = args[ 0 ].dup() ;
	
	for ( i = 1 ; i < args.length ; i ++ ) {
		v.add( args[ i ] ) ;
	}
	
	return v ;
} ;



exports.zmul = ( ... args ) => {
	var i , v ;
	
	v = args[ 0 ].dup() ;
	
	for ( i = 1 ; i < args.length ; i ++ ) {
		v.mul( args[ i ] ) ;
	}
	
	return v ;
} ;



exports.zpow = ( base , exp ) => base.dup().intPow( exp ) ;



// The function itself should know its identifier
for ( let key in exports ) {
    if ( ! exports[ key ].id ) { exports[ key ].id = key ; }
}

