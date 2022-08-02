import React from 'react';

export type CardProps = {
   refProp?: React.Ref<HTMLDivElement>;
   frontCard: JSX.Element;
   backCard: JSX.Element;
   frontButton: JSX.Element | string;
   backButton: JSX.Element | string;
};

export default function FlippableCard({
   refProp,
   frontCard,
   backCard,
   frontButton,
   backButton,
}: CardProps) {
   const genericButtonContent = (d: JSX.Element | string) => {
      let text = d as string;
      let element = d as JSX.Element;
      return <span>{text}</span> || element;
   };
   return (
      <div className="card" ref={refProp}>
         <div className="card-front">
            {frontCard}
            <button
               className="card-flip-button"
               onClick={event => {
                  Array.from(
                     event.currentTarget.parentElement!.parentElement!.children,
                  ).forEach(e => e.classList.add('flip'));
               }}>
               {genericButtonContent(frontButton)}
            </button>
         </div>
         <div className="card-back">
            {backCard}
            <button
               className="card-flip-button"
               onClick={event => {
                  Array.from(
                     event.currentTarget.parentElement!.parentElement!.children,
                  ).forEach(e => e.classList.remove('flip'));
               }}>
               {genericButtonContent(backButton)}
            </button>
         </div>
      </div>
   );
}
