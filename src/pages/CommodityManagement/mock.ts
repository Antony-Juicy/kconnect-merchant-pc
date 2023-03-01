import logo from '@/assets/logo.svg';

const productNames = ['Lee T 恤', 'oTo 牛崽褲', '太陽能手電筒', '大哥大型剃鬚刀', '剃鬚刀型風筒', '攞你命3000']
const types = ['靚靚', '靚靚', '實用道具', '實用道具', '實用道具', '攞命']
const brands = ['Lee', 'oTo', '達聞西', '達聞西', '達聞西', '達聞西']

const productList = Array.from({length: 25}).map((i: any, o: number) => {
	const _index = Math.floor( Math.random() * 6 )
	return {
		productId: o * 100 + o,
		productCode: o * 1000 + o,
		fileUrl: o !== 0 ? logo : null,
		productName: productNames[_index],
		companyProductTypeName: types[_index],
		price: Math.floor( Math.random() * 1000 ),
		currency: 'HKD',
		productCategoryName: _index < 2 ? '服飾' : '道具',
		companyBrandName: brands[_index],
		salesState: o % 2,
	}
})

export const productPage = {
	code: 10000,
	data: {
		totalCount: 25,
		data: productList,
	}
}

export const cascaderOptions: any[] = [
  {
    value: '前端_id',
    label: '前端',
    children: [
      {
        value: 'web_id',
        label: 'web',
        children: [
          {
            value: 'js_id',
            label: 'js',
          },
          {
            value: 'html_id',
            label: 'html',
          },
        ],
      },
    ],
  },
  {
    value: '后端_id',
    label: '后端',
    children: [
      {
        value: 'java_id',
        label: 'java',
        children: [
          {
            value: '面向编程_id',
            label: '面向编程',
          },
        ],
      },
    ],
  },
];

export const selectOptions: any[] = [
	{
		label: '服飾',
		value: 0,
	},
	{
		label: '道具',
		value: 2,
	},
]