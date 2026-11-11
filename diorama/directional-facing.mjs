/**
 * Diorama-specific camera-relative eight-way walk and natural avatar turning.
 * Pure functions: safe to test without Three.js/WebGL.
 *
 * Yaw 0 looks toward +Z. Yaw PI looks toward -Z (into the scene at startup).
 * Left and right movement turn the character, never force a strafe pose.
 */
export function worldWalkDirection(right,forward,cameraYaw){
 const length=Math.hypot(right,forward);
 if(length<=.03)return {x:0,z:0,length:0};
 const r=right/length,f=forward/length;
 return {
  x:f*Math.sin(cameraYaw)-r*Math.cos(cameraYaw),
  z:f*Math.cos(cameraYaw)+r*Math.sin(cameraYaw),
  length
 };
}
export function shortestTurnDelta(currentYaw,targetYaw){
 return Math.atan2(Math.sin(targetYaw-currentYaw),Math.cos(targetYaw-currentYaw));
}
export function faceWalkDirection(currentYaw,x,z,dt,turnSpeed=8.5){
 const magnitude=Math.hypot(x,z);
 if(magnitude<.001||dt<=0)return currentYaw;
 const targetYaw=Math.atan2(x,z);
 const difference=shortestTurnDelta(currentYaw,targetYaw);
 // Never teleport the facing even for a 180-degree reversal.
 // Exponential easing feels natural at 30/60/120 FPS, and the maximum
 // angular speed avoids unnatural rapid turns on a single low-FPS frame.
 const maxDelta=Math.max(0,turnSpeed)*Math.min(dt,.05);
 const smooth=1-Math.exp(-13*Math.min(dt,.05));
 const turn=Math.sign(difference)*Math.min(
  Math.abs(difference),maxDelta,Math.abs(difference)*smooth
 );
 return currentYaw+turn;
}
