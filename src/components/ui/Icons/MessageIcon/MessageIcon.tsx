import * as React from 'react';
import Svg, { Path } from 'react-native-svg';

function MessageIcon(props: any) {
  return (
    <Svg
      xmlns="http://www.w3.org/2000/svg"
      width={41}
      height={41}
      fill="none"
      viewBox="0 0 41 41"
      {...props}>
      <Path
        fill="#CDCDCD"
        d="M12.095 35.36l-1.04 1.708.012.007.012.007 1.016-1.723zm-2.545-.617l.57 1.917.026-.008.026-.008-.622-1.9zM6.099 35.77l-.57-1.917-.015.004-.015.005.6 1.908zm-1.401-1.335l-1.916-.572-.006.019-.005.019 1.927.534zm1.144-3.832l-1.885-.668-.016.047-.015.049 1.916.572zm-.12-1.54l-1.756.955.025.047.028.045 1.704-1.047zm14.744-6.33l-.028 2h.028v-2zm0-4.38l-.029 2h.029v-2zm-7.876 4.38v2h.03l-.029-2zm7.944-21.316c-11.098 0-19.117 9.075-19.117 19.109h4c0-7.965 6.365-15.11 15.117-15.11v-4zm19.05 19.057c0-10.159-8.195-19.057-19.05-19.057v4c8.552 0 15.05 7.012 15.05 15.057h4zM20.5 39.584c9.42 0 19.083-7.297 19.083-19.11h-4c0 9.3-7.556 15.11-15.083 15.11v4zm-9.421-2.502c2.833 1.671 6.3 2.501 9.421 2.501v-4c-2.482 0-5.234-.675-7.389-1.946l-2.032 3.445zm-.907-.438c.036-.012.042-.009.032-.01-.008 0 .006-.001.056.014a1.8 1.8 0 01.283.124c.14.073.3.167.512.296l2.08-3.417c-.822-.5-2.306-1.432-4.208-.808l1.245 3.8zM6.67 37.687l3.45-1.027-1.14-3.834-3.45 1.027 1.14 3.834zM2.771 33.9c-.317 1.142-.007 2.33.848 3.12.833.77 2.004.995 3.08.657l-1.2-3.816a.876.876 0 01.833.22c.308.285.354.67.293.888L2.771 33.9zm1.155-3.87l-1.144 3.832 3.832 1.145 1.145-3.833-3.833-1.145zm.093.08a.376.376 0 01-.058-.164c-.002-.03.004-.033-.004-.012l3.77 1.336c.357-1.007.338-2.217-.3-3.255L4.019 30.11zm-2.602-9.585c0 3.255.945 6.54 2.549 9.492l3.514-1.91c-1.334-2.455-2.063-5.09-2.063-7.582h-4zm19.077.207a.207.207 0 01-.215-.207h-4a4.207 4.207 0 004.159 4.207l.056-4zm.159-.19a.189.189 0 01-.058.134.175.175 0 01-.13.056v4a4.193 4.193 0 004.188-4.19h-4zm-.187-.19c.105 0 .186.077.186.19h4a4.182 4.182 0 00-4.186-4.19v4zm-.187.173c0-.039.015-.084.056-.125.04-.04.078-.049.102-.048l.057-4c-2.33-.033-4.215 1.88-4.215 4.173h4zm8.062.207a.175.175 0 01-.129-.056.188.188 0 01-.057-.134h-4c0 2.289 1.856 4.19 4.186 4.19v-4zm.187-.19a.189.189 0 01-.058.134.175.175 0 01-.129.056v4a4.193 4.193 0 004.187-4.19h-4zm-.187-.19c.106 0 .187.077.187.19h4a4.182 4.182 0 00-4.187-4.19v4zm-.186.19c0-.113.08-.19.186-.19v-4a4.182 4.182 0 00-4.186 4.19h4zm-19.751 0c0 2.3 1.883 4.19 4.186 4.19v-4a.18.18 0 01-.126-.06.186.186 0 01-.06-.13h-4zm4.186-4.19a4.182 4.182 0 00-4.186 4.19h4c0-.113.08-.19.186-.19v-4zm4.187 4.19a4.182 4.182 0 00-4.187-4.19v4c.106 0 .187.077.187.19h4zm-4.158 4.19c2.282-.033 4.158-1.875 4.158-4.19h-4c0 .08-.072.188-.215.19l.057 4z"
      />
    </Svg>
  );
}

export default MessageIcon;
