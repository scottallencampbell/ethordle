import React from 'react';

interface IToggle {
    id: string,
    isOn: boolean,
    handleToggle: Function,
    offText: string,
    onText: string
 }

export const Toggle = ({ id, isOn, handleToggle, offText, onText }) => {
    return (
      <>
        <input className='toggle-checkbox' id={id} type='checkbox' checked={isOn} onChange={handleToggle} />
        <label className={`toggle-label ${isOn ? 'is-on' : ''} `} htmlFor={id}>
          <p>{onText}</p><p>{offText}</p>
          <span className='toggle-button' />
          <span className='pinwheel'></span><strong>Working...</strong>
        </label>
      </>
    );
  };
