export default function ResetButton({ shotRemaining, backgroundcolors }) {
    if (shotRemaining == 0 && backgroundcolors === 'royalblue') {
    return (
      <p style={{ color: 'white' , position:'absolute', bottom:4, left:'50%', transform:'translateX(-50%)', fontSize: '12px'}}>
        Reset (R)
      </p>
    )
  }
  return null; // 条件が満たされない場合はnullを返す
}