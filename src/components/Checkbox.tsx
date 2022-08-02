import {useState} from 'react';

interface CheckboxProps {
   label: string;
   checked: boolean;
   onChange: (checked: boolean) => void;
}

export default function Checkbox({label, checked, onChange}: CheckboxProps) {
   const [isChecked, setIsChecked] = useState(checked);

   return (
      <div
         className="checkbox-button"
         style={{
            top: '-69.8281px',
            right: '90px',
            display: 'flex',
            alignItems: 'center',
         }}>
         <label style={{display: 'flex', alignItems: 'center'}}>
            <input
               type="checkbox"
               onChange={() => {
                  onChange(!checked);
               }}
            />
            <svg
               className={`checkbox ${checked ? 'checkbox--active' : ''}`}
               aria-hidden="true"
               viewBox="0 0 15 11"
               fill="none">
               <path
                  style={{transform: 'scale(1.2) translate(0px, -3.1px)'}}
                  d="M 2 6 L 6 10.8 L 15 1"
                  strokeWidth="2"
                  stroke={checked ? '#85afff' : 'none'}
               />
            </svg>
            <span
               style={{
                  fontFamily: 'Lexend',
                  fontSize: '0.8rem',
                  verticalAlign: 'middle',
                  color: '#85afff',
                  fontWeight: 500,
               }}>
               {label}
            </span>
         </label>
      </div>
   );
}
