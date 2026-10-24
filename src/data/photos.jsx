// A plain JavaScript array of objects — this is the "data source" for the
// gallery. In a real app this would come from an API; here it demonstrates
// how JS variables/arrays feed dynamic JSX rendering via .map() and .filter().

const photos = [
  {
    id: 1,
    title: "Misty Mountains",
    category: "nature",
    url: "https://picsum.photos/id/1018/600/400",
  },
  {
    id: 2,
    title: "City Lights",
    category: "urban",
    url: "https://picsum.photos/id/1015/600/400",
  },
  {
    id: 3,
    title: "Golden Retriever",
    category: "animals",
    url: "https://picsum.photos/id/1025/600/400",
  },
  {
    id: 4,
    title: "Coastal Cliffs",
    category: "nature",
    url: "https://picsum.photos/id/1043/600/400",
  },
  {
    id: 5,
    title: "Downtown Bridge",
    category: "urban",
    url: "https://picsum.photos/id/1031/600/400",
  },
  {
    id: 6,
    title: "Curious Fox",
    category: "animals",
    url: "https://picsum.photos/id/1074/600/400",
  },
  {
    id: 7,
    title: "Forest Trail",
    category: "nature",
    url: "https://picsum.photos/id/1040/600/400",
  },
  {
    id: 8,
    title: "Night Skyline",
    category: "urban",
    url: "https://picsum.photos/id/1048/600/400",
  },
  {
    id: 9,
    title: "Alpine Lake",
    category: "nature",
    url: "https://picsum.photos/id/1053/600/400",
  },
];

export default photos;
