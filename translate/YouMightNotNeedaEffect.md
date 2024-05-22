# Bạn có thể không cần Effect

Effect là một lối thoát từ mô hình React. Chúng cho phép bạn "bước ra ngoài" React và đồng bộ các component của bạn với một vài external system như một non-React widget, mạng, hoặc trình duyệt DOM. Nếu external system không có liên quan (ví dụ, nếu bạn muốn cập nhật trạng thái của một component khi một vài props hoặc trạng thái thay đổi), bạn không cần dùng Effect. Loại bỏ unnecessary Effect để làm cho code của bạn trở nên dễ theo dõi hơn, chạy nhanh hơn và ít dễ lỗi hơn.  

> ### Bạn sẽ học
>
> - Tại sao và và làm thế nào để loại bỏ unnecessary Effect từ component của bạn
> - Làm thế nào để cache expensive computations không có Effect
> - Làm thế nào để cài đặc lại và adjust trạng thái component không có Effect
> - Làm thế nào để chia sẻ logic giữa các event handler
> - Logic nào nên được di chuyển đến event handler
> - Làm thế nào để thông báo cho component cha về các thay đổi

