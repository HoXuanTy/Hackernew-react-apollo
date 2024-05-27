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

## Gửi yêu cầu POST

*Form* component gửi hai loại yêu cầu POST. Nó gửi một sự kiện phân tích khi nó mounts. Khi bạn điền vào form và nhấn vào nút submit, nó sẽ gửi một yêu cầu POST tới enpoint /api/register:

```js
function Form() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  // ✅ Good: This logic should run because the component was displayed
  useEffect(() => {
    post('/analytics/event', { eventName: 'visit_form' });
  }, []);

  // 🔴 Avoid: Event-specific logic inside an Effect
  const [jsonToSubmit, setJsonToSubmit] = useState(null);
  useEffect(() => {
    if (jsonToSubmit !== null) {
      post('/api/register', jsonToSubmit);
    }
  }, [jsonToSubmit]);

  function handleSubmit(e) {
    e.preventDefault();
    setJsonToSubmit({ firstName, lastName });
  }
  // ...
}
```
Hãy áp dụng các tiêu chí tương tự như trong ví dụ trước.

Phân tích yêu cầu POST sẽ vẫn ở trong Effect. Đây là lí do gửi sự kiện phân tích là vì biểu mẫu đã được hiển thị. (Nó sẽ kích hoạt hai lần trong quá trình phát triển, nhưng hãy xem ở đây làm thế nào để giải quyết nó.)

Tuy nhiên, yêu cầu POST /api/register không xảy ra do biểu mẫu đang được hiển thị. Bạn chỉ muốn gửi yêu cầu vào một thời điểm cụ thể: khi người dùng nhấn nút. Nó chỉ nên xảy ra khi có sự tương tác cụ thể đó. Xóa Effect thứ hai và di chuyển yêu cầu POST trong trình xử lý sự kiện: 

```js
function Form() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  // ✅ Good: This logic runs because the component was displayed
  useEffect(() => {
    post('/analytics/event', { eventName: 'visit_form' });
  }, []);

  function handleSubmit(e) {
    e.preventDefault();
    // ✅ Good: Event-specific logic is in the event handler
    post('/api/register', { firstName, lastName });
  }
  // ...
}
```

## Chuỗi tính toán

Đôi khi bạn cảm thấy muốn xâu chuỗi Effects mà mỗi Efects điều chỉnh trạng thái dự trên trạng thái khác nhau:

```js
function Game() {
  const [card, setCard] = useState(null);
  const [goldCardCount, setGoldCardCount] = useState(0);
  const [round, setRound] = useState(1);
  const [isGameOver, setIsGameOver] = useState(false);

  // 🔴 Avoid: Chains of Effects that adjust the state solely to trigger each other
  useEffect(() => {
    if (card !== null && card.gold) {
      setGoldCardCount(c => c + 1);
    }
  }, [card]);

  useEffect(() => {
    if (goldCardCount > 3) {
      setRound(r => r + 1)
      setGoldCardCount(0);
    }
  }, [goldCardCount]);

  useEffect(() => {
    if (round > 5) {
      setIsGameOver(true);
    }
  }, [round]);

  useEffect(() => {
    alert('Good game!');
  }, [isGameOver]);

  function handlePlaceCard(nextCard) {
    if (isGameOver) {
      throw Error('Game already ended.');
    } else {
      setCard(nextCard);
    }
  }

  // ...
```

Có hai vấn đê với đoạn code này.

Một trong các vấn đề đó là rất không hiệu quả: component (và con của nó) phải re-render giữa mỗi lần gọi *set* trong chuỗi. Trong ví dụ trên, trong trường hợp khác (setCard -> render -> setGoldCardCount -> render -> setRound -> render -> setIsGameOver -> render) có 3 re-render cần thiết của cái cây bên dưới.

Ngay cả khi nó không chậm, khi mã của bạn phát triển, bạn sẽ gặp phải trường hợp 'chuỗi' bạn đã viết không phù hợp với các yêu cầu mới. Hãy tưởng tượng bạn đang thêm một cách để bước qua lịch sử di chuyển của trò chơi. Bạn sẽ làm điều đó bằng cách cập nhật mỗi biến trạng thái thành một giá trị từ quá khứ. Tuy nhiên, đặt lại trang thái *Card* thành giá trị từ quá khứ sẽ kích hoạt lại chuỗi Effects và thay đổi dữ liệu đang hiển thị. Mã như vậy thường cứng nhắc và dễ vỡ.

Trong trường hợp này, tốt hơn hết là bạn nên tính toán những gì có thể trong quá trình rendering và điều chỉnh trạng thái trong trình xử lý sự kiện:

```js
function Game() {
  const [card, setCard] = useState(null);
  const [goldCardCount, setGoldCardCount] = useState(0);
  const [round, setRound] = useState(1);

  // ✅ Calculate what you can during rendering
  const isGameOver = round > 5;

  function handlePlaceCard(nextCard) {
    if (isGameOver) {
      throw Error('Game already ended.');
    }

    // ✅ Calculate all the next state in the event handler
    setCard(nextCard);
    if (nextCard.gold) {
      if (goldCardCount <= 3) {
        setGoldCardCount(goldCardCount + 1);
      } else {
        setGoldCardCount(0);
        setRound(round + 1);
        if (round === 5) {
          alert('Good game!');
        }
      }
    }
  }

  // ...
}
```

Điều này hiệu quả hơn rất nhiều. Ngoài ra, nếu bạn thực hiện xem lịch sử game, bây giờ bạn sẽ có thể đặt từng biến trạng thái thành một cách di chuyển trong quá khứ mà không kích hoạt chuỗi Effect điều chỉnh mọi giá trị khác. Nếu bạn cần sử dụng lại logic giữa một số trình xử lý sự kiện, bạn có thể trích xuất một hàm và gọi nó từ các trình xử lý đó.

Hãy nhớ các trình xử lý sự kiện bên trong, trạng thái hoạt động như một ảnh chụp nhanh. Ví dụ, thậm chí sau khi bạn gọi *setRound(round + 1)*, biến *round* sẽ phản ánh giá trị tại thời điểm người dùng nhấp vào button. Nếu bạn cần sử dụng giá trị tiếp theo để tính toán, hãy xác định nó theo cách thủ công như *const nextRound = round + 1*.

Trong một số trường hợp, bạn không thể tính toán trạng thái tiếp theo trực tiếp trong trình xử lý sự kiện. Ví dụ: hãy tưởng tượng một biểu mẫu có nhiều menu thả xuống trong đó các tùy chọn của menu thả xuống tiếp theo phụ thuộc vào giá trị đã chọn của menu thả xuống trước đó. Sau đó, một chuỗi Effect là phù hợp vì bạn đang đồng bộ hóa với mạng.

## Đang khởi tạo ứng dụng

Một số logic chỉ nên chạy một lần khi tải ứng dụng.

Bạn có thể muốn đặt nó vào Effect trong component cấp cao nhất:

```js
function App() {
  // 🔴 Avoid: Effects with logic that should only ever run once
  useEffect(() => {
    loadDataFromLocalStorage();
    checkAuthToken();
  }, []);
  // ...
}
```

Tuy nhiên, bạn nhanh chóng phát hiện rằng nó nhanh chóng chạy hai lần trong quá trình phát triển. Điều này có thể là gây ra vấn đề - Cho ví dụ, có thể nó làm mất hiệu lực mã thông báo xác thực vì chức năng này không được thiết kế để gọi hai lần. Nói chung, các thành phần của bạn phải có khả năng phục hồi khi được gắn lại. Điều này có thể bao gồm component cấp cao nhất của App bạn.

Mặc dù nó có thể không bao giờ được nhắc lại trong thực tế sản xuất, việc tuân theo các ràng buộc giống nhau trong tất cả các component giúp việc di chuyển và sử dụng lại mã dễ dàng hơn. Nếu một số logic phải chạy một lần cho mỗi lần tải ứng dụng hơn là một lần cho mỗi component mount, thêm một biến cấp cao nhất để theo dõi xem nó đã được thực thi chưa:

```js
let didInit = false;

function App() {
  useEffect(() => {
    if (!didInit) {
      didInit = true;
      // ✅ Only runs once per app load
      loadDataFromLocalStorage();
      checkAuthToken();
    }
  }, []);
  // ...
}
```

Bạn có thể chạy trong quá trình khởi tạo module và trước khi ứng ụng renders:

```js
if (typeof window !== 'undefined') { // Check if we're running in the browser.
   // ✅ Only runs once per app load
  checkAuthToken();
  loadDataFromLocalStorage();
}

function App() {
  // ...
}
```

Code ở cấp cao nhất chạy một lần khi component của bạn được nhập, ngay cả khi nó không được hiển thị. Để tránh làm chậm hoặc bất ngờ khi nhập các component tùy ý, đừng lạm dụng mẫu này. Giữ logic khởi tạo trên toàn ứng dụng cho các module ở component gốc giống như App.js hoặc trong điểm vào của ứng dụng bạn.

## Thông báo cho component cha khi state thay đổi

Giả sử rằng bạn viết một *Toggle* component với một state *isOn* có thể là *True* hoặc *False*. Có một vài cách khác nhau để chuyển đổi nó (bằng cách nhấp hoặc kéo). Bạn có thể muốn thông báo cho component cha liệu *Toggle* bên trong state có thay đổi, do đó bạn phơi bày một xự kiện *onChange* và gọi nó trong Effect:

```js
function Toggle({ onChange }) {
  const [isOn, setIsOn] = useState(false);

  // 🔴 Avoid: The onChange handler runs too late
  useEffect(() => {
    onChange(isOn);
  }, [isOn, onChange])

  function handleClick() {
    setIsOn(!isOn);
  }

  function handleDragEnd(e) {
    if (isCloserToRightEdge(e)) {
      setIsOn(true);
    } else {
      setIsOn(false);
    }
  }

  // ...
}
```

Giống như trước đó, điều này không lý tường. *Toggle* cập nhật trạng thái trước tiên, và React cập nhật màn hinh. Sau đó React chạy Effect, gọi hàm onChange được truyền từ component cha. Bây giờ component cha sẽ cập nhật trạng thái của chính nó, bắt đầu một render khác. Sẽ tốt hơn nếu làm mọi thứ trong một lần duy nhất.

Xóa Effect và thay vào đó cập nhật trạng thái của cả hai thành phần trong cùng một trình xử lý sự kiện:

```js
function Toggle({ onChange }) {
  const [isOn, setIsOn] = useState(false);

  function updateToggle(nextIsOn) {
    // ✅ Good: Perform all updates during the event that caused them
    setIsOn(nextIsOn);
    onChange(nextIsOn);
  }

  function handleClick() {
    updateToggle(!isOn);
  }

  function handleDragEnd(e) {
    if (isCloserToRightEdge(e)) {
      updateToggle(true);
    } else {
      updateToggle(false);
    }
  }

  // ...
}
```

Với cách tiếp cận này, cả hai *Toggle* component và component cha của nó cập nhật trạng thái của chúng trong sự kiện. React batches updates từ các component khác nhau với nhau, vì vậy sẽ chỉ có một render pass.

Bạn cũng có thể loại bỏ hoàn toàn state, và thay vì nhận *isOn* từ component cha:

```js
// ✅ Also good: the component is fully controlled by its parent
function Toggle({ isOn, onChange }) {
  function handleClick() {
    onChange(!isOn);
  }

  function handleDragEnd(e) {
    if (isCloserToRightEdge(e)) {
      onChange(true);
    } else {
      onChange(false);
    }
  }

  // ...
}
```

“Lifting state up” cho phép component cha kiểm soát hoàn toàn *Toggle* bằng cách chuyển đổi của chính thành phần cha. Điều này có nghĩa là component cha sẽ chứa nhiều logic hơn nhưng tổng thể sẽ có ít trạng thái hơn để lo lắng. Bất cứ khi nào bạn cố gắng đồng bộ hóa hai biến trạng thái khác nhau, thay vào đó hãy thử nâng trạng thái lên!

## Truyền data tới component cha

*Child* component này tìm nạp dữ liệu và sau đó truyền nó tới component cha trong một Effect:
```js
function Parent() {
  const [data, setData] = useState(null);
  // ...
  return <Child onFetched={setData} />;
}

function Child({ onFetched }) {
  const data = useSomeAPI();
  // 🔴 Avoid: Passing data to the parent in an Effect
  useEffect(() => {
    if (data) {
      onFetched(data);
    }
  }, [onFetched, data]);
  // ...
}
```

Trong React, luồng dữ liệu chạy từ component cha đến các component con. Khi bại thấy có gì đó sai trên màn hình, bạn có thể theo dõi thông tin đến từ đâu bằng cách đi lên chuỗi component cho đến khi bạn tìm thấy truyền sai prop hoặc state sai. Khi component con cập nhật trạng thái của component cha trong Effect, luồng dữ liệu trở nên khó theo dõi. Vì cả con và cha đều cần cùng một dữ liệu, hãy để component cha tìm nạp dữ liệu và thay vào đó truyền nó cho component con:

```js
function Parent() {
  const data = useSomeAPI();
  // ...
  // ✅ Good: Passing data down to the child
  return <Child data={data} />;
}

function Child({ data }) {
  // ...
}
```

Điều này đơn giản hơn và giữ cho luồng dữ liệu có thể dự đoán được: luồng dữ liệu được truyền từ cha tới con.

## Đăng ký một kho lưu trữ bên ngoài

Thỉnh thoảng, component của bạn sẽ cần đăng ký một số dữ liệu từ bên ngoài trạng thái React. Dữ liệu này có thể là từ thư viện của bên thứ ba hoặc được tích hợp sẵn trên trình duyệt API. Vì dữ liệu này có thể thay đổi mà React không hề hay biết, bạn cần đăng kí thủ công nó cho component của bạn. Điều này thường hoàn thành với một Effect, ví dụ:

```js
function useOnlineStatus() {
  // Not ideal: Manual store subscription in an Effect
  const [isOnline, setIsOnline] = useState(true);
  useEffect(() => {
    function updateState() {
      setIsOnline(navigator.onLine);
    }

    updateState();

    window.addEventListener('online', updateState);
    window.addEventListener('offline', updateState);
    return () => {
      window.removeEventListener('online', updateState);
      window.removeEventListener('offline', updateState);
    };
  }, []);
  return isOnline;
}

function ChatIndicator() {
  const isOnline = useOnlineStatus();
  // ...
}
```

Ở đây, component đăng kí một kho lưu trữ dữ liệu bên ngoài (trong trường hợp này, API trình duyệt *navigator.onLine*). Vì API này không tồn tại trên máy chủ (vì vậy nó không thể sử dụng cho HTML ban đầu), ban đầu trạng thái được đặt là *true*. Bất cứ khi nào giá trị của kho dữ liệu đó thay đổi trong trình duyệt, component cập nhật trạng thái đó.

Mặc dù việc sử dụng Effect cho điều này là phổ biến, React có một hook được xây dựng với mục đích đăng kí kho lưu trữ bên ngoài được ưa thích. Xóa Effect và thay thế nó với *useSyncExternalStore*:

```js
function subscribe(callback) {
  window.addEventListener('online', callback);
  window.addEventListener('offline', callback);
  return () => {
    window.removeEventListener('online', callback);
    window.removeEventListener('offline', callback);
  };
}

function useOnlineStatus() {
  // ✅ Good: Subscribing to an external store with a built-in Hook
  return useSyncExternalStore(
    subscribe, // React won't resubscribe for as long as you pass the same function
    () => navigator.onLine, // How to get the value on the client
    () => true // How to get the value on the server
  );
}

function ChatIndicator() {
  const isOnline = useOnlineStatus();
  // ...
}
```
Cách tiếp cận này ít bị lỗi hơn so với việc đồng bộ hóa thủ công dữ liệu có thể thay đổi sang trạng thái React với Effect. Thông thường, bạn sẽ viết một Hook tùy chỉnh như useOnlineStatus() ở trên để bạn không cần lặp lại mã này trong các component riêng lẻ. Đọc thêm về cách đăng ký các kho lưu trữ bên ngoài từ các component React.

## Tìm nạp dữ liệu

Nhiều ứng dụng sử dụng Effect để bắt đầu tìm nap dữ liệu. Nó khá phổ biến khi viết tìm nạp dự liệu trong Effect như sau:

```js
function SearchResults({ query }) {
  const [results, setResults] = useState([]);
  const [page, setPage] = useState(1);

  useEffect(() => {
    // 🔴 Avoid: Fetching without cleanup logic
    fetchResults(query, page).then(json => {
      setResults(json);
    });
  }, [query, page]);

  function handleNextPageClick() {
    setPage(page + 1);
  }
  // ...
}
```

Bạn không cần phải di chuyển tìm nạp này sang trình xử lý sự kiện. Điều này có vẻ mâu thuẫn với các ví dụ trước đó khi bạn cần đưa logic vào trình xử lý sự kiện! Tuy nhiên, hãy cân nhắc rằng sự kiện đánh máy không phải là lý do chính để tìm nạp. Đầu vào của tìm kiếm thường được điền sẵn từ URL, người dùng có thể điều hướng quay trở lại và chuyển tiếp mà không cần chạm vào đầu vào.

Nó không phải quan trọng *Page* và *Query* đến từ đâu. Trong khi component này dễ thấy, bạn muốn giữ *result* đồng bộ với dữ liệu từ mạng cho *Page* hiện tại và *Query* . Đây là lí do tại sao nó là một Effect. 

Tuy nhiên code ở trên có một lỗi. Tưởng tượng bạn nhập nhanh *"hello"*. Sau đó *Query* sẽ thay đổi từ *"h"*, đến *"he", "hel", "hell"* và *"hello*. Điều này sẽ khởi động các tìm nạp riêng biệt, nhưng không có gì đảm bảo về thứ tự các phản hồi sẽ đến. Ví dụ, *"hell* có thể đến sau phản hồi *"hello"*. Vì nó sẽ gọi *setResults()* lần cuối, bạn sẽ hiển thị kết quả tìm kiếm lỗi. Điều này gọi là *“race condition”*: Hai yêu cầu khác nhau *"Raced" với nhau và đến theo một thứ tự khác với bạn mong đợi.

Để khắc phục race condition, bạn cần thêm các chức năng dọn dẹp để bỏ qua các phản hồi cũ:

```js
function SearchResults({ query }) {
  const [results, setResults] = useState([]);
  const [page, setPage] = useState(1);
  useEffect(() => {
    let ignore = false;
    fetchResults(query, page).then(json => {
      if (!ignore) {
        setResults(json);
      }
    });
    return () => {
      ignore = true;
    };
  }, [query, page]);

  function handleNextPageClick() {
    setPage(page + 1);
  }
  // ...
}
```

Điều này đảm bảo rằng khi Effect của bạn tìm nạp dữ liệu, tất cả phản hồi ngoại trừ phản hồi được yêu cầu cuối cùng sẽ bị bỏ qua. Bạn cũng có thể muốn nghĩ về phản hồi của bộ nhớ đệm (Vì vậy người dùng có thể nhấn quay lại và xem màn hình phía trước ngay lập tức), Làm thế nào để tìm nạp dữ liệu trên server, (để HTML được máy chủ kết xuất ban đầu chứa nội dung được tìm nạp thay vì spinner), và làm thế nào tránh  network waterfalls (để con có thể tìm nạp dữ liệu mà không cần đợi mọi cha mẹ).

Vấn đề này được áp dụng cho mọi thư viện UI, không chỉ cho React. Việc giải quyết chúng không hề đơn giản, đó là lý do tại sao các frameworks hiện đại cung cấp cơ chế tìm nạp dữ liệu tích hợp hiệu quả hơn so với tìm nạp trong Effect.

Nếu bạn không sử dụng frameworks và (không muốn xây dựng của riêng bạn) nhưng muốn tìm nạp dữ liều từ Effect trở nên tiện lợi hơn, hãy xem xét việc trích xuất logic tìm nạp của bạn thành một hook tùy chỉnh như ví dụ sau:

```js
function SearchResults({ query }) {
  const [page, setPage] = useState(1);
  const params = new URLSearchParams({ query, page });
  const results = useData(`/api/search?${params}`);

  function handleNextPageClick() {
    setPage(page + 1);
  }
  // ...
}

function useData(url) {
  const [data, setData] = useState(null);
  useEffect(() => {
    let ignore = false;
    fetch(url)
      .then(response => response.json())
      .then(json => {
        if (!ignore) {
          setData(json);
        }
      });
    return () => {
      ignore = true;
    };
  }, [url]);
  return data;
}
```

Bạn có thể tự mình xây dựng một Hook như thế này hoặc sử dụng một trong nhiều giải pháp đã có sẵn trong hệ sinh thái React.**Mặc dù chỉ điều này sẽ không hiệu quả bằng việc sử dụng cơ chế tìm nạp dữ liệu tích hợp của framework, việc di chuyển logic tìm nạp dữ liệu vào Hook tùy chỉnh sẽ giúp việc áp dụng chiến lược tìm nạp dữ liệu hiệu quả sau này dễ dàng hơn.**

Nhìn chung bất cứ khi nào bạn phải dùng đên việc viết Effect. hãy để ý khi nào bạn có thể trích xuất một phần chức năng vào Hook tùy chỉnh với API được khai báo và xây dựng có mục đích hơn như *useData* ở trên. Bạn càng có ít lệnh gọi useEffect trong các component của bạn thì bạn càng dễ dàng duy trì ứng dụng của bạn hơn.

## Tóm Tắt lại

- Nếu bạn có thể tính toán một thứ gì đó trong quá trình render, bạn không cần một Effect.
- Để lưu trữ các phép tính tốn kém, thêm *useMemo* thay vì dùng *useEffect*.
- Để đặt lại trạng thái của toàn bộ cây component, truyền một *key* khác cho nó.
- Để đặt lại một trạng thái cụ thể khi phản hồi từ một props thay đổi, thiết lập nó trong quá trình rendering.
- Code chạy vì một component đã hiển thị nên ở trong Effect, phần còn lại nên ở trong sự kiện.
- Nếu bạn cần cập nhật trạng thái của một số component, tốt hơn nên thực hiện việc đó trong một sự kiện duy nhất.
- Bất cứ khi nào bạn cố gắng đồng bộ hóa các biến trạng thái trong các component khác nhau, hãy xem xét nâng trạng thái lên.
- Bạn có thể tìm nạp dữ liệu trong Effect, nhưng bạn cần thực hiện dọn dẹp để tránh race conditions.

## Hãy thử một số Thử Thách

**Thử thách 1**: Chuyển đổi dữ liệu mà không cần Effect
*TodoList* bên hiển thị danh sách các công việc. Khi hộp kiểm "Chỉ hiển thị các việc cần làm đang hoạt động" được chọn, các việc cần làm đã hoàn thành sẽ không được hiển thị trong danh sách. Bất kể việc cần làm nào được hiển thị, chân trang sẽ hiển thị số lượng việc cần làm chưa hoàn thành

Đơn giản hóa component này bằng cách loại bỏ tất cả các trạng thái và Effect không cần thiết.

```js
//App.js
import { useState, useEffect } from 'react';
import { initialTodos, createTodo } from './todos.js';

export default function TodoList() {
  const [todos, setTodos] = useState(initialTodos);
  const [showActive, setShowActive] = useState(false);
  const [activeTodos, setActiveTodos] = useState([]);
  const [visibleTodos, setVisibleTodos] = useState([]);
  const [footer, setFooter] = useState(null);

  useEffect(() => {
    setActiveTodos(todos.filter(todo => !todo.completed));
  }, [todos]);

  useEffect(() => {
    setVisibleTodos(showActive ? activeTodos : todos);
  }, [showActive, todos, activeTodos]);

  useEffect(() => {
    setFooter(
      <footer>
        {activeTodos.length} todos left
      </footer>
    );
  }, [activeTodos]);

  return (
    <>
      <label>
        <input
          type="checkbox"
          checked={showActive}
          onChange={e => setShowActive(e.target.checked)}
        />
        Show only active todos
      </label>
      <NewTodo onAdd={newTodo => setTodos([...todos, newTodo])} />
      <ul>
        {visibleTodos.map(todo => (
          <li key={todo.id}>
            {todo.completed ? <s>{todo.text}</s> : todo.text}
          </li>
        ))}
      </ul>
      {footer}
    </>
  );
}

function NewTodo({ onAdd }) {
  const [text, setText] = useState('');

  function handleAddClick() {
    setText('');
    onAdd(createTodo(text));
  }

  return (
    <>
      <input value={text} onChange={e => setText(e.target.value)} />
      <button onClick={handleAddClick}>
        Add
      </button>
    </>
  );
}
//Todo.js
let nextId = 0;

export function createTodo(text, completed = false) {
  return {
    id: nextId++,
    text,
    completed
  };
}

export const initialTodos = [
  createTodo('Get apples', true),
  createTodo('Get oranges', true),
  createTodo('Get carrots'),
];
```



Bạn cũng có thể muốn thêm một số logic để xử lý lỗi và theo dõi xem nội dung có đang tải hay không.

**Thử thách 2:** Lưu trữ một phép toán vào bộ nhớ đẹm mà không cần Effects

Trong ví dụ này, lọc việc cần làm đã được chiết xuất vào một chức năng riêng biệt gọi là getVisibeTodos(). Hàm này chứa một *console.log()* gọi bên trong nó giúp bạn nhận thấy mỗi khi nó được gọi. Chuyển đổi "Chỉ hiển thị những việc cần làm" và lưu ý rằng  getVisibleTodos() chạy lại. This is expected because visible todos change when you toggle which ones to display.

Nhiệm vụ của bạn là loại bỏ Effect tính toán lại danh sách *visibleTodos* trong component *TodoList*. Tuy nhiên, bạn cần đảm bảo rằng *getVisibleTodos()* không chạy lại (và do đó không in bất kỳ nhật ký nào) khi bạn nhập vào đầu vào.

```js
import { useState, useEffect } from 'react';
import { initialTodos, createTodo, getVisibleTodos } from './todos.js';

export default function TodoList() {
  const [todos, setTodos] = useState(initialTodos);
  const [showActive, setShowActive] = useState(false);
  const [text, setText] = useState('');
  const [visibleTodos, setVisibleTodos] = useState([]);

  useEffect(() => {
    setVisibleTodos(getVisibleTodos(todos, showActive));
  }, [todos, showActive]);

  function handleAddClick() {
    setText('');
    setTodos([...todos, createTodo(text)]);
  }

  return (
    <>
      <label>
        <input
          type="checkbox"
          checked={showActive}
          onChange={e => setShowActive(e.target.checked)}
        />
        Show only active todos
      </label>
      <input value={text} onChange={e => setText(e.target.value)} />
      <button onClick={handleAddClick}>
        Add
      </button>
      <ul>
        {visibleTodos.map(todo => (
          <li key={todo.id}>
            {todo.completed ? <s>{todo.text}</s> : todo.text}
          </li>
        ))}
      </ul>
    </>
  );
}

//todos.js
let nextId = 0;
let calls = 0;

export function getVisibleTodos(todos, showActive) {
  console.log(`getVisibleTodos() was called ${++calls} times`);
  const activeTodos = todos.filter(todo => !todo.completed);
  const visibleTodos = showActive ? activeTodos : todos;
  return visibleTodos;
}

export function createTodo(text, completed = false) {
  return {
    id: nextId++,
    text,
    completed
  };
}

export const initialTodos = [
  createTodo('Get apples', true),
  createTodo('Get oranges', true),
  createTodo('Get carrots'),
];
```