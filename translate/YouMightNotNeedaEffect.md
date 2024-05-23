# Bạn có thể không cần Effect

Effect là một lối thoát từ mô hình React. Chúng cho phép bạn "bước ra ngoài" React và đồng bộ các component của bạn với một vài external system như một non-React widget, mạng, hoặc trình duyệt DOM. Nếu external system không có liên quan (ví dụ, nếu bạn muốn cập nhật trạng thái của một component khi một vài props hoặc trạng thái thay đổi), bạn không cần dùng Effect. Loại bỏ unnecessary Effect để làm cho code của bạn trở nên dễ theo dõi hơn, chạy nhanh hơn và ít dễ lỗi hơn.  

> ## Bạn sẽ học
>
> - Tại sao và và làm thế nào để loại bỏ unnecessary Effect từ component của bạn
> - Làm thế nào để cache expensive computations không có Effect
> - Làm thế nào để cài đặc lại và adjust trạng thái component không có Effect
> - Làm thế nào để chia sẻ logic giữa các trình xử lý sự kiện (event handler)
> - Logic nào nên được di chuyển đến event handler
> - Làm thế nào để thông báo cho component cha về các thay đổi

# Làm thế nào để loại bỏ các Effect không cần thiết

Có hai trường hợp phổ biến chúng ta không cần dùng Effect:

- **Bạn không cần các Effect để transform dữ liệu cho rendering**: Ví dụ, Giả sử bạn muốn lọc một danh sách trước khi hiển thị nó. Bạn có thể cảm thấy teampled để viết một Effect để cập nhật trạng thái của biến khi danh sách thay đổi. Tuy nhiên, đây là inefficien. Khi bạn cập nhật trạng thái, React sẽ gọi hàm component đầu tiên của bạn để tính toán cái gì nên hiển thị trên màn hình. Sau đó React sẽ *"Commit"* những thay đổi ở DOM, cập nhật ở màn hình. Sau đó react sẽ chạy Effect của bạn. Nếu Effect của bạn cũng immediately cập nhật trạng thái, việc này sẽ khởi động lại toàn bộ quá trình từ scratch! để tránh các render không cần thiết, chuyển đổi tất cả các dư liệu ở cấp cao nhất component của bạn. Code đó sẽ tự động re-run bất cứ khi nào props hoặc trạng thái thay đổi.

- **Bạn không cần effect để xử lý các sự kiện người dùng**: Ví dụ, giử sử bạn muốn gửi một /api/buy POST request và hiển thị một cái thông báo khi người dùng mua một sản phẩm. Trong trình xử lý sự kiện nhấp vào button Buys, bạn biết chính xác chuyện gì đã xảy ra. Vào thời điểm mà Effect chạy, bạn không cần biết người dùng đã làm gì(ví dụ, Button nào đã được nhấn). Đấy là lý do tại sao bạn sẽ thường xử lý sự kiện người dùng trong corresponding trình xử lý sự kiện.

Bạn cần Effect để đồng bộ với bên ngoài hệ thống. Ví dụ, Bạn có thể viết một cái effect để giữ một cái JQuery widget đồng bộ với trạng thái React. Bạn cũng có thể fetch dữ liệu với Effect : Ví dụ, Bạn có thể đồng bộ kết quả tìm kiếm với truy vấn tìm kiếm hiện tại. Hãy nhớ rằng các frameworks hiện đại cung cấp cơ chế fetching dữ liệu hiệu quả hơn viết Effect trực tiếp vào component của bạn.

Để giúp bạn có trực giác đúng, Hãy xem qua một số ví dụ phổ biến!

# Cập nhật trạng thái dựa trên Props hoặc State

Giả sử bạn có một component với hai biến trạng thái: firstName và lastName. Bạn muốn tính toán fullName từ chúng bằng cách nối chúng lại với nhau. Tuy nhiên, bạn muốn fullName nó cập nhật mỗi khi firstName hoặc lastName thay đổi. Bản năng đầu tiên của bạn có thể là thêm fullName vào biến state và cập nhật nó trong một Effect:

```js
    function Form() {
    const [firstName, setFirstName] = useState('Taylor');
    const [lastName, setLastName] = useState('Swift');

    // 🔴 Avoid: redundant state and unnecessary Effect
    const [fullName, setFullName] = useState('');
    useEffect(() => {
        setFullName(firstName + ' ' + lastName);
    }, [firstName, lastName]);
    // ...
    }
```
Điều này phức tạp hơn mức cần thiết. Nó cũng không hiệu quả: Nó render toàn bộ giá trị cũ cho fullName, sau đó ngay lập tức (immediately)  re-render với giá trị cập nhật. Loại bỏ biến state và Effect:
  
```js
    function Form() {
    const [firstName, setFirstName] = useState('Taylor');
    const [lastName, setLastName] = useState('Swift');
    // ✅ Good: calculated during rendering
    const fullName = firstName + ' ' + lastName;
    // ...
    }
```

**Khi một thứ gì đó đã được tính toán từ props hoặc state đã tồn tại, đừng đặt nó vào trong state. Thay vào đó, tính toán nó trong quá trình rendering.** Điều này đảm bảo code của bạn nhanh hơn( bạn tránh được các cập nhật “cascading”), đơn giản hơn (bạn loại ỏ một vài đoạn code), và ít bị dễ bị lỗi hơn(bạn tránh được các lỗi do các biến trạng thái khác nhau không đồng bộ với nhau). Nếu cách tiếp cận này có vẻ mới mẻ đối với bạn, Suy nghĩ trong React sẽ giải thích những gì nên go into state.

# Các phép tính tốn kém bộ nhớ đệm

Component này tính toán *visibleTodos* bằng cách lấy *todos* mà nó nhận được từ props và lọc chúng theo *filter* prop. Bạn có thể cảm thấy muốn lưu trữ kết quả trong state và cập nhật nó trong Effect:

```js
    function TodoList({ todos, filter }) {
    const [newTodo, setNewTodo] = useState('');

    // 🔴 Avoid: redundant state and unnecessary Effect
    const [visibleTodos, setVisibleTodos] = useState([]);
    useEffect(() => {
        setVisibleTodos(getFilteredTodos(todos, filter));
    }, [todos, filter]);

    // ...
    }
```

Như ví dụ trước, cả hai cái này đều không cần thiết và không hiệu quả (inefficient). Đầu tiên hãy loại bỏ state và Effect:

```js
    function TodoList({ todos, filter }) {
    const [newTodo, setNewTodo] = useState('');
    // ✅ This is fine if getFilteredTodos() is not slow.
    const visibleTodos = getFilteredTodos(todos, filter);
    // ...
    }
```
Thông thường, thì code này ổn! Nhưng có thể ===getFilteredTodos()=== nó chậm hoặc bạn có nhiều *todos*. Trong trường hợp đó bạn không muốn tính toán ===getFiteredTodos()=== if một vài unrelated biến trạng thái như newTodo có thay đổi.

Bạn có thể lưu vào bộ nhớ đệm (hoặc "memoize") một phép tính tốn kém bằng cách bọc nó trong useMemo hook:

```js
    import { useMemo, useState } from 'react';

    function TodoList({ todos, filter }) {
    const [newTodo, setNewTodo] = useState('');
    const visibleTodos = useMemo(() => {
        // ✅ Does not re-run unless todos or filter change
        return getFilteredTodos(todos, filter);
    }, [todos, filter]);
    // ...
    }
```
Hoặc viết với một dòng:

```js
    import { useMemo, useState } from 'react';

    function TodoList({ todos, filter }) {
    const [newTodo, setNewTodo] = useState('');
    // ✅ Does not re-run getFilteredTodos() unless todos or filter change
    const visibleTodos = useMemo(() => getFilteredTodos(todos, filter), [todos, filter]);
    // ...
    }
```

Điều này cho React biết rằng bạn không muốn inner funtion chạy lại trừ khi *todos* hoặc *filter* có thay đổi. React sẽ ghi nhớ và trả về giá trị của *getFilterTodos()* trong quá trình lần đầu tiên render. Trong lần render tiếp theo, nó sẽ kiểm tra nếu *todos* hoặc *filter* là khác nhau. Nếu chúng giống với lần cuối cùng, *useMemo* sẽ trả về kết quả cuối cùng đã được lưu trữ. Nhưng nếu chúng khác nhau, React sẽ gọi lại inner function lần nữa (và lưu kết quả đó).

Chức năng của bạn sẽ bọc trong useMemo và chạy trong quá trình rendering, vì vậy nó chỉ làm việc cho phép toán thuần túy.

## Làm thế nào để biết một phếp toán có tốn kém không?
    
Nói chung, trừ khi bạn tạo hoặc lặp qua hàng nghìn đối tượng, nó có lẽ không tốn kém. Nếu bạn muốn tự tin hơn, bạn có thể thêm consolog đo  thời gian của một đoạn mã:

```js
console.time('filter array');
const visibleTodos = getFilteredTodos(todos, filter);
console.timeEnd('filter array');
```
Thực hiện tương tác mà bạn đang đo lường (ví dụ: nhập đầu dữ liệu đầu vào). Sau đó bạn sẽ thấy nhật ký như sau *filter array: 0.15ms* trong bảng điều khiển của bạn. Nếu tổng thời gian được ghi lại tăng lên một lượng đáng kể (chẳng hạn như 1 mili giây trở lên). Có thể sẽ hợp lý để ghi nhớ phép tính đó. Như một cuộc thí nghiệm, sau đó bạn có thể bọc phép toán của mình trong useMome để xác thực tổng thời gian được ghi lại có decreased cho tương tác của nó hoặc không:

```js
console.time('filter array');
const visibleTodos = useMemo(() => {
  return getFilteredTodos(todos, filter); // Skipped if todos and filter haven't changed
}, [todos, filter]);
console.timeEnd('filter array');
```

useMemo sẽ không làm lần render đầu tiên nhanh hơn. Nó chỉ giúp bạn bỏ qua việc không cân thiết khi cập nhật.
Hãy nhớ rằng máy của bạn có thể nhanh hơn người của bạn vì nó một ý tưởng tốt để kiểm tra hiệu suất với artificial chậm lại. Ví dụ, Chrome thường có một CPU Throttling cho lượng chọn này.

Cũng lưu ý rằng việc đo lường hiệu suất trong quá trình phát triển sẽ không mang lại cho bạn kết quả chính xác nhất.(Ví dụ, khi Strict Mode được bật, bạn sẽ thấy component của bạn sẽ render với hai hoặc thay vì một lần). Để lấy thời gian chính xác nhất, xây dựng ứng dụng của bạn cho sản xuất và kiểm tra nó trên thiết bị của bạn giống như người dùng của bạn.


## Khởi động lại tất cả state khi một prop thay đổi

Component ProfilePage nhận một UserId prop. Trang chứa một bình luận đầu vào, và bạn dùng biến state để giữ giá trị của nó. Một ngày, bạn nhận thấy một vấn đề: Khi bạn điều hướng từ một profile đến profile cái khác, *comment* state không thiết lập lại. Kết quả là, nó dễ vô tình đăng một bình luận sai profile người dùng. Để sửa lỗi này, bạn muốn dọn dẹp biến *comment* state cho đến khi userId thay đổi:

```js
export default function ProfilePage({ userId }) {
  const [comment, setComment] = useState('');

  // 🔴 Avoid: Resetting state on prop change in an Effect
  useEffect(() => {
    setComment('');
  }, [userId]);
  // ...
}
```
Nó không hiệu quả bởi vì *ProfilePage* và con nó sẽ render đầu tiên với giá trị cũ, và sau đó render một lần nữa. Nó cũng phức tạp hơn bởi vì bạn cần làm điều này trong mỗi component có một vài trạng thái bên trong *ProfilePage*. Ví dụ: nếu giao diện người dùng comment được lồng nhau, bạn cũng muốn xóa comment state lồng nhau.

Thay vào đó bạn có thể cho React biết rằng hồ sơ của mỗi người dùng về mặt khái niệm là một hồ sơ khác nhau bằng cách cấp cho nó một khóa rõ ràng. Tách component của bạn thành hai và truyền thuộc tính *key* từ component bên ngoài vào component bên trong:

```js
export default function ProfilePage({ userId }) {
  return (
    <Profile
      userId={userId}
      key={userId}
    />
  );
}

function Profile({ userId }) {
  // ✅ This and any other state below will reset on key change automatically
  const [comment, setComment] = useState('');
  // ...
}
```

Thông thường, React duy trì trạng thái khi cùng một component được hiển thị tại cùng một vị trí. Bằng cách truyền một *userId* như một *key* đên *Profile* component, bạn đang yêu cầu React coi hai *Profile* component có *userId* khác nhau là hai component khác nhau không được chia sẻ bất kỳ state nào. Bất cứ khi nào key (mà bạn đã đặt thành userId) thay đổi. React sẽ tạo lại DOM và cài lại trạng thái của profile component và tất cả con của nó. Bây giờ trường *comment* sẽ tự động dọn dẹp khi điều hướng giữa các profiles.

Lưu ý rằng trong ví dụ này, Chỉ bên ngoài *ProfilePage*  component được xuất và hiển thị cho các tệp khác trong dự án. Các component hiển thị *ProfilePage* không cần truyền key cho nó: Chúng truyền *userId* như một prop thông thường. Thực tế ProfilePage truyền nó dưới dạng key cho component *Profile* bên trong là một implementation detail.

## Điều chỉnh một vài trạng thái khi prop thay đổi

Thỉnh thoảng, bạn có thể muốn đặt lại hoặc điều chỉnh một phần trạng thái khi thay đổi giá trị, nhưng không phải tất cả.

*List* componet này nhận danh sách các *items* như một prop, và duy trì các mục đã chọn trong biến *selection* state. Bạn muốn đặt lại selection thành null bất cứ khi nào *item* prop nhận một mảng khác:

```js
function List({ items }) {
  const [isReverse, setIsReverse] = useState(false);
  const [selection, setSelection] = useState(null);

  // 🔴 Avoid: Adjusting state on prop change in an Effect
  useEffect(() => {
    setSelection(null);
  }, [items]);
  // ...
}
```
Điều này không lý tưởng. Mỗi lần *item* thay đổi, *List* và các componet con sẽ hiển thị *selection* với giá trị cũ lúc đầu. Sau đo React sẽ cập nhật DOM và chạy Effects. Cuối cùng, gọi *setSection(null)* sẽ gây ra một lần render khác của *List* và cacs componet con của nó, khởi động lại quá trình này một lần nữa.

Bắt đầu xóa Effect. Thay vào đó, chỉnh sử trạng thái trực tiếp trong quá trình hiển thị:

```js
function List({ items }) {
  const [isReverse, setIsReverse] = useState(false);
  const [selection, setSelection] = useState(null);

  // Better: Adjust the state while rendering
  const [prevItems, setPrevItems] = useState(items);
  if (items !== prevItems) {
    setPrevItems(items);
    setSelection(null);
  }
  // ...
}
```

Việc lưu trữ thông tin từ các render trước đó như thế này có thể khó hiểu, nhưng tốt hơn là cập nhật trạng thái tương tự trong một Effect. Trong ví dụ trên, *setSelection* được gọi trực tiếp trong quá trình render. React sẽ re-render *List* ngay sau khi nó thoát ra với một câu lệnh return. React không rendered *List* con or cập nhật DOM nữa, vì vậy điều này cho phép *List* con bỏ qua hiển thị giá trị *selection* cũ.

Khi bạn cập nhật componet trong quá trình rendering, React sẽ loại bỏ JSX được trả về và ngay lập tức thử rendering lại. Để tránh thử lại cascading rất chậm, React chỉ cho phép bạn cập nhật trạng thái của cùng một thành phần trong quá trình render. Nếu bạn cập nhật trạng thái các componet trong quá trình render, bạn sẽ thấy một lỗi. Một điều kiện như *items !== prevItems* là cần thiết để tránh vòng lặp. Bạn có thể chỉ chỉnh sửa trạng thái như này, nhưng bất kì side Effect khác ( như thay đổi DOM hoặc cài đặt lại timeouts) vẫn nằm ở trong trình xử lý sự kiện hoặc Effect để giữ component thuần khiết. 

Mặc dù mẫu này hiệu quả hơn Effect, nhưng hầu hết các componet không cần thiết đến nó. Dù có làm nó thế nào đi nữa, điều chỉnh state dựa trên prop hoặc trạng thái khác sẽ khiến luồng dữ liệu của bạn khó hiểu và khó gỡ lỗi hơn. Luôn luôn checked liệu bạn có thể đặt lại tất cả trạng thái với một key hoặc tính toán mọi thứ trong quá trình rendering không. 
Ví dụ: thay vì lưu trữ (và đặt lại) dữ liệu *item* đã chọn, bạn có thể lưu trữ item ID đã chọn:

```js
    function List({ items }) {
    const [isReverse, setIsReverse] = useState(false);
    const [selectedId, setSelectedId] = useState(null);
    // ✅ Best: Calculate everything during rendering
    const selection = items.find(item => item.id === selectedId) ?? null;
    // ...
    }
```
Bây giờ không cần "điều chỉnh" trạng thái nữa. Nếu mục có ID đã chọn có trong danh sách, nó vẫn được chọn. Nếu không, *selection* đa tính toán trong quá trình rendering sẽ là *null* bởi vì nó không khớp với mục đã tìm thấy. Hành vì này khác hẳn, nhưng được cho là tốt hơn bởi vì hầu hết sự thay đổi từ item duy trì sự lựa chọn.

## Chia sẻ logic giữa các trình xử lý sự kiện

Giả sử bạn có một trang sản phẩm với hai button (Buy và Checkout) cả hai đểu cho phép bạn mua sản phẩm. Bạn muốn hiển thị một cái thông báo bất cứ khi nào người dùng đặt sản phẩm vào trong giỏ hàng. Gọi *showNotification()* rình xử lý nhấp chuột vào trong cả hai button, cảm thấy lặp đi lặp lại nên bạn có thể muốn đặt logic này vào một Effect:

```js
function ProductPage({ product, addToCart }) {
  // 🔴 Avoid: Event-specific logic inside an Effect
  useEffect(() => {
    if (product.isInCart) {
      showNotification(`Added ${product.name} to the shopping cart!`);
    }
  }, [product]);

  function handleBuyClick() {
    addToCart(product);
  }

  function handleCheckoutClick() {
    addToCart(product);
    navigateTo('/checkout');
  }
  // ...
}
```
Effect này là không cần thiết. Nó cũng rất có thể sẽ gây ra lỗi. Ví dụ, giả sử rằng ứng dụng của bạn "ghi nhớ" giỏ hàng giữa các lần tải lại trang. Nếu bạn thêm một sản phẩm vào giỏ hàng một lần nữa và tải làm mới trang, thông báo sẽ xuất hiện lên lại nữa. Nó sẽ xuất hiện mỗi khi bạn tải lại trang sản phẩm. Đó là vì *product.isInCart* sẽ là *true* khi tải trang, vì vậy Effect trên sẽ gọi showNotification().

Khi bạn không chăc liệu một vài đoạn code nên ở trong Effect hoặc bên trong trình xử lý sự kiện, tự hỏi tại sao đoạn code này lại cần chạy. Dùng Effect chỉ dành cho code nên chạy bởi vì component đã được hiển thị cho người dùng. Trong ví dụ này, thông báo nên xuất hiện bởi vì người dùng đã nhấn vào nút button, không phải bởi vì trang này đã hiển thị! xóa Effect và đặt logic chia sẽ vào trong một funtion được gọi từ cả hai trình xử lý sự kiện:

```js
function ProductPage({ product, addToCart }) {
  // ✅ Good: Event-specific logic is called from event handlers
  function buyProduct() {
    addToCart(product);
    showNotification(`Added ${product.name} to the shopping cart!`);
  }

  function handleBuyClick() {
    buyProduct();
  }

  function handleCheckoutClick() {
    buyProduct();
    navigateTo('/checkout');
  }
  // ...
}
```

Điều này loại bỏ Effect không cần thiết và sửa lỗi.