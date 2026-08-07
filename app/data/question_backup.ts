export type Question = {
  id: number;
  text: string;
  answer: "○" | "×";
  explanation: string;
};
export const questions: Question[] = [
  {
    id: 1,
    text: "おねじの有効径を工作過程で測定するには、三針法で行なうのがいちばん正確である。",
    answer: "○",
    explanation: "工作過程でおねじの有効径を正確に測定するには、三針法が適しています。",
  },
    {
    id: 2,
    text: "ねじのピッチ（P）とは、ねじの軸線を含む断面において、隣り合うねじ山の対応する2点間の軸方向の距離である。",
    answer: "○",
    explanation: "ピッチとは、隣り合うねじ山の対応する点どうしの軸方向の距離です。",
  },
];