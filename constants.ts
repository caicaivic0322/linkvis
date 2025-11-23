
export const MEMORY_SIZE = 48; // Total blocks in memory grid
export const ANIMATION_DELAY_MS = 800; // Slower for better code following

export const STRUCT_SNIPPET_BASE = `struct Node {
    int value;
    Node* next;
    Node(int data) : value(data), next(nullptr) {}
};

class LinkedList {
private:
    Node* head; // 当前指向: {{HEAD_ADDR}}
    int size;   // 当前大小: {{SIZE}}
public:
    LinkedList() {
        head = nullptr;
        size = 0;
    }

    // 常用操作方法...
    void insertAtEnd(int value);
    void insertAtHead(int num);
    bool deleteNode(int num);
    void display();
};`;

export const CPP_SNIPPETS = {
  INSERT_HEAD: `void insertAtHead(int num) {
    Node* newNode = new Node(num);
    if (head == nullptr) {
        head = newNode;
    }
    else {
        newNode->next = head;
        head = newNode;
    }
    size++;
}`,
  INSERT_TAIL: `void insertAtEnd(int value) {
    Node* newNode = new Node(value);
    if (head == nullptr) {
        head = newNode;
    } else {
        Node* temp = head;
        while (temp->next != nullptr) {
            temp = temp->next;
        }
        temp->next = newNode;
    }
    size++;
}`,
  INSERT_AT: `bool insertByPosition(int position, int value) {
    if (position < 0 || position > size) return false;
    if (position == 0) {
        insertAtHead(value);
        return true;
    }
    Node* temp = head;
    for (int i = 0; i < position - 1; i++) {
        temp = temp->next;
    }
    Node* newNode = new Node(value);
    newNode->next = temp->next;
    temp->next = newNode;
    size++;
    return true;
}`,
  DELETE_VAL: `bool deleteNode(int num) {
    if (head == nullptr) return false;
    if (head->value == num) {
        head = head->next;
        return deleteHead();
    }
    Node* temp = head;
    while (temp->next != nullptr && temp->next->value != num) {
        temp = temp->next;
    }
    if (temp->next == nullptr) {
        return false;
    }
    Node* current = temp->next;
    temp->next = current->next;
    delete current;
    size--;
    return true;
}`,
  DELETE_TAIL: `bool deleteAtEnd() {
    if (head == nullptr) {
        return false;
    }
    Node* temp = head;
    while (temp->next != nullptr) {
        temp = temp->next;
    }
    temp->next = nullptr; // Leaking memory in simplified view vs actual delete
    size--;
    return true;
}`,
  SEARCH: `bool findValue(const int num) {
    Node* temp = head;
    while (temp != nullptr) {
        if (temp->value == num) {
            return true;
        }
        temp = temp->next;
    }
    return false;
}`
};
