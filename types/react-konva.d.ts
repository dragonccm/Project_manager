// react-konva 19 không khai báo `children` trong prop types của Stage/Layer/Group.
// Với @types/react 19 (đã bỏ children ngầm định khỏi ClassAttributes), mọi
// <Stage>/<Layer>/<Group> có con đều báo lỗi TS2322/TS2559 dù chạy vẫn đúng.
// Bổ sung khai báo cho khớp hành vi thực tế của thư viện.
import 'react'
import 'konva/lib/Layer'
import 'konva/lib/Group'
import 'react-konva'

declare module 'konva/lib/Layer' {
  interface LayerConfig {
    children?: React.ReactNode
  }
}

declare module 'konva/lib/Group' {
  interface GroupConfig {
    children?: React.ReactNode
  }
}

declare module 'react-konva' {
  interface StageProps {
    children?: React.ReactNode
  }
}
