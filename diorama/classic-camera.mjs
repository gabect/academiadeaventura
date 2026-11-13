/**
 * Academia de Aventura — classic elevated camera, modern smooth render.
 * Parallel projection: no perspective foreshortening or horizon fisheye.
 * All constants and calculations are kept independent of WebGL for QA.
 */
export const CLASSIC_CAMERA=Object.freeze({
 heading:Math.PI,
 pitch:1.07,              // 61.3° above the ground, near top-down 3/4
 verticalWorldUnits:20.5, // one screen ~20.5 units tall at 1×
 distance:44,
 targetHeight:1.15,
 followDamping:7.8,
 verticalDamping:5.2,
 lookAhead:1.25,
 pixelRatioCap:1.8
});
export function classicFrustum(width,height,zoom=1){
 if(!(width>0&&height>0&&zoom>0))throw Error('Invalid viewport or zoom');
 const halfHeight=CLASSIC_CAMERA.verticalWorldUnits/(2*zoom);
 const halfWidth=halfHeight*width/height;
 return {left:-halfWidth,right:halfWidth,top:halfHeight,bottom:-halfHeight};
}
export function classicOffset(){
 const {distance,pitch,heading}=CLASSIC_CAMERA;
 const horizontal=distance*Math.cos(pitch);
 return {
  x:-Math.sin(heading)*horizontal,
  y:Math.sin(pitch)*distance,
  z:-Math.cos(heading)*horizontal
 };
}
export function classicFacingDirection(right,forward){
 // Fixed-north camera: W advances north(-Z), D advances east(+X).
 const length=Math.hypot(right,forward);
 if(length<.03)return {x:0,z:0,length:0};
 return {x:right/length,z:-forward/length,length};
}
