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
    
    Nói chung, trừ khi bạn tạo hoặc lặp qua hàng ngàn đối tượng, nó sẽ không tốn kém.