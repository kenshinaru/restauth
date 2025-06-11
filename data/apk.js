const search = async(args) => {
  const res = await fetch(`http://ws75.aptoide.com/api/7/apps/search?query=${encodeURIComponent(args)}&limit=1000`);
  const data = await res.json();
  const json = data.datalist.list.map(v => ({    
    name: v.name,
    id: v.package,
  }));
  return {
    status: true,
    data: json
  }
}

const download = async(id) => {
  const res = await fetch(`http://ws75.aptoide.com/api/7/apps/search?query=${encodeURIComponent(id)}&limit=1`);
  const data = await res.json();
  const appData = data.datalist.list[0];
  return {
    status: true,
    data: {
    img: appData?.icon,
    developer: appData?.store.name,
    appname: appData?.name,
    url: appData?.file.path,
    }
  };
}

export default { search, download }
