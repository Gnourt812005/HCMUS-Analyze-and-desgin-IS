export const salesStaff = [
  { name: "Nguyễn Văn An", phone: "0901 234 567" },
  { name: "Trần Thị Bích", phone: "0902 345 678" },
  { name: "Lê Hoàng Cường", phone: "0903 456 789" },
  { name: "Phạm Thị Dung", phone: "0904 567 890" },
  { name: "Hoàng Văn Em", phone: "0905 678 901" },
];

export function getRandomSalesStaff() {
  return salesStaff[Math.floor(Math.random() * salesStaff.length)];
}
