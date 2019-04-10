import React from 'react';

const SearchBox = ({searchChange,clicked,earningsclick}) =>
{
    return (
        <div className='pa2'>
            <input 
                className='bg-lightest-blue pa3 ba b--green'
                type='search' 
                placeholder='enter ticker' 
                onChange={searchChange}
                />
            <input 
                className='f4 link dim br2 ph5 pv3 ml3 mb2 dib white bg-mid-gray'
                type='button' 
                value='getctr'
                onClick={clicked}
                />                
            <input 
                className='f4 link dim br2 ph5 pv3 ml3 mb2 dib dark-red bg-light-yellow'
                type='button' 
                value='earnings'
                onClick={earningsclick}
                />                
        </div>
    );
}

export default SearchBox;